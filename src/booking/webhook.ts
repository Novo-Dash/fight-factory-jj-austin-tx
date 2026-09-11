// =============================================================================
// webhook.ts — Transporte e montagem dos 2 webhooks + fetch de slots ao vivo
// -----------------------------------------------------------------------------
// Webhook 1 → LeadConnector/GHL (lead). Payload flexível, mapeado na UI do GHL.
// Webhook 2 → workflow n8n compartilhado (agendamento). ⚠️ CONTRATO CRÍTICO:
//   calendar_id casa o calendário, parent_name nomeia o contato, hora 12h AM/PM,
//   data local, child_name só quando há criança.
// Slots → mesmo workflow n8n (action:"get_slots"), free-slots ao vivo do GHL.
// =============================================================================

import { getAttribution } from './attribution'
import {
  PROGRAM_AUDIENCE,
  PROGRAM_CALENDAR_ID,
  PROGRAM_LABEL,
  formatTimeLabel,
  isoDate,
  type Program,
  type SlotMap,
} from './schedule'
import type { BookingData } from './types'

// --- location_id: definido UMA vez; a URL do Webhook 1 é derivada dele -------
// (o location_id é o segmento após /hooks/ no Inbound Webhook do LeadConnector,
// e é o MESMO valor que vai no location_id do Webhook 2 → nunca divergem).
const GHL_LOCATION_ID = '7ai3O8KqknYgJu59oYfE'
const LEAD_WEBHOOK_UUID = 'zvG8tH1SZiNIXKU5a0GQ'
const LEAD_WEBHOOK_URL = `https://services.leadconnectorhq.com/hooks/${GHL_LOCATION_ID}/webhook-trigger/${LEAD_WEBHOOK_UUID}`

// --- Webhook 2 + slots: FIXO para todas as academias (produção, já validado) -
const N8N_ORIGIN = 'https://n8n.novodash.com'
const N8N_PATH = 'webhook' // "webhook-test" só se for mexer no workflow compartilhado
const BOOKING_WEBHOOK_URL = `${N8N_ORIGIN}/${N8N_PATH}/landing-page-booking`

// Origem do lead/contato — SEMPRE em inglês (academia US).
const SOURCE_LABEL = 'Landing Page - Fight Factory'

// -----------------------------------------------------------------------------
// Helpers de payload
// -----------------------------------------------------------------------------

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') }
}

/** "+1" + 10 dígitos (US). Mantém os dígitos crus se não bater no padrão. */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits ? `+${digits}` : ''
}

/**
 * Nome da criança APENAS quando o programa é de kids E o campo está preenchido;
 * senão null → a chave `child_name` é OMITIDA do payload. Nunca manda o nome do
 * adulto como child_name.
 */
function childNameOrNull(d: BookingData): string | null {
  if (PROGRAM_AUDIENCE[d.program] !== 'kids') return null
  const v = (d.childName ?? '').trim()
  return v.length ? v : null
}

// -----------------------------------------------------------------------------
// Transporte — fire-and-forget, nunca lança, sempre loga
// -----------------------------------------------------------------------------

async function post(url: string, payload: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // entrega mesmo se o modal/aba fechar
    })
    if (!res.ok) {
      // webhook falho = lead/agendamento perdido → loga em dev E prod
      console.warn(`[webhook] ${url} → HTTP ${res.status}`)
      return
    }
    if (import.meta.env.DEV) console.info(`[webhook] ${url} → ok`)
  } catch (err) {
    // Atenção: erro de CORS no console não prova que não chegou — o servidor
    // pode ter recebido. Fonte da verdade = log de execução do n8n.
    console.warn(`[webhook] ${url} → network/CORS error`, err)
  }
}

// -----------------------------------------------------------------------------
// Webhook 1 — Lead (destino: LeadConnector / GHL)
// -----------------------------------------------------------------------------

/**
 * `source` defaults to the paid-traffic landing page. Other surfaces in this
 * repo (the institutional site) pass their own label so the CRM can tell a
 * website enquiry from an ad lead. Nothing else about the payload changes.
 */
export function sendLeadWebhook(data: BookingData, source: string = SOURCE_LABEL): void {
  const { first, last } = splitName(data.name)
  const cn = childNameOrNull(data)
  const payload = {
    event: 'lead_captured',
    name: data.name, // Full Name do contato = parent_name (responsável)
    firstName: first,
    lastName: last,
    email: data.email,
    phone: data.phone,
    phoneE164: toE164(data.phone),
    program: PROGRAM_LABEL[data.program], // nome do programa → campo Program do CRM
    audience: PROGRAM_AUDIENCE[data.program], // adults | kids → roteamento do workflow
    ...(cn ? { child_name: cn } : {}), // só quando há criança (kids)
    submittedAt: new Date().toISOString(),
    source,
    // marketing attribution (só aqui) — espalha as chaves que vieram na URL
    ...getAttribution(),
  }
  void post(LEAD_WEBHOOK_URL, payload)
}

// -----------------------------------------------------------------------------
// Webhook 2 — Agendamento (destino: workflow n8n compartilhado) ⚠️ CONTRATO
// -----------------------------------------------------------------------------

export function sendBookingWebhook(data: BookingData, source: string = SOURCE_LABEL): void {
  if (!data.date || !data.time) {
    console.warn('[webhook] booking sem data/hora, ignorado')
    return
  }
  const cn = childNameOrNull(data)
  const payload = {
    parent_name: data.name, // responsável; o workflow split → first/last do contato
    ...(cn ? { child_name: cn } : {}), // só kids; adults omite → título cai no parent_name
    email: data.email,
    phone: data.phone, // formato exibido "(555) 555-5555" é aceito
    calendar_id: PROGRAM_CALENDAR_ID[data.program], // casa o calendário no n8n (imune a rename)
    location_id: GHL_LOCATION_ID,
    stage: 'appointment_selected', // ignorado pelo workflow; valor fixo
    appointment_date: isoDate(data.date), // YYYY-MM-DD local
    appointment_time: formatTimeLabel(data.time), // h:mm AM/PM
    source, // campo JÁ EXISTENTE do contrato — muda o valor, nunca o conjunto
  }
  void post(BOOKING_WEBHOOK_URL, payload)
}

// -----------------------------------------------------------------------------
// Slots ao vivo — mesmo workflow n8n, action:"get_slots" (§5.1)
// -----------------------------------------------------------------------------

/**
 * Busca os free-slots do calendário ao vivo do GHL (via n8n). Devolve um
 * SlotMap { "YYYY-MM-DD": ["HH:MM", …] }. A resposta do GHL vem como
 * { "YYYY-MM-DD": { slots: ["<ISO já no fuso da academia>"] }, traceId }.
 * Cada ISO traz o offset da academia, então data/hora locais saem por string
 * (slice) sem conversão de fuso. Entradas sem `slots` array (ex.: traceId) são
 * ignoradas. LANÇA em erro de rede/HTTP — o chamador trata com fallback.
 */
export async function fetchSlots(program: Program): Promise<SlotMap> {
  const res = await fetch(BOOKING_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'get_slots',
      location_id: GHL_LOCATION_ID,
      calendar_id: PROGRAM_CALENDAR_ID[program],
    }),
  })
  if (!res.ok) throw new Error(`get_slots → HTTP ${res.status}`)
  const data: unknown = await res.json()
  const out: SlotMap = {}
  if (data && typeof data === 'object') {
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      const slots = (val as { slots?: unknown })?.slots
      if (!Array.isArray(slots)) continue // ignora traceId e afins
      const times = slots
        .filter((iso): iso is string => typeof iso === 'string')
        .map((iso) => iso.slice(11, 16)) // "2026-06-15T18:15:00-05:00" → "18:15"
        .filter((t) => /^\d{2}:\d{2}$/.test(t))
      if (times.length) out[key] = times
    }
  }
  return out
}
