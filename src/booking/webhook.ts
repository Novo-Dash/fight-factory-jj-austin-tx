// =============================================================================
// webhook.ts — Transporte e montagem dos 2 webhooks + busca de turmas ao vivo
// -----------------------------------------------------------------------------
// Webhook 1 → LeadConnector/GHL (lead). Payload flexível, mapeado na UI do GHL.
// Webhook 2 → workflow n8n compartilhado (agendamento). ⚠️ CONTRATO CRÍTICO:
//   calendar_id casa o calendário, parent_name nomeia o contato, hora 12h AM/PM,
//   data local, child_name só quando há criança.
// Turmas + horários → mesmo workflow n8n (action:"get_programs", §5.1): UMA
// chamada ao abrir o modal/montar /book traz a lista de programas e os
// free-slots de todos, ao vivo do GHL. Nada de lista estática no repositório.
// =============================================================================

import { getAttribution, getSourceLabel } from './attribution'
import {
  PROGRAM_OVERRIDES,
  formatTimeLabel,
  isoDate,
  type Audience,
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

// --- Webhook 2 + turmas: FIXO para todas as academias (produção, validado) ---
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
 * adulto como child_name. O audience vem pronto do GHL (§5.1), nunca do nome.
 */
function childNameOrNull(d: BookingData): string | null {
  if (d.program?.audience !== 'kids') return null
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
 * Visita vinda de link do GHL (SMS/e-mail com 'full_name'/'email'/'phone' na URL)
 * sem campanha na sessão: o contato já existe no CRM. Mandar o Webhook 1 de
 * novo sobrescreveria a atribuição dele com vazio e o source com o rótulo
 * fixo (spec §3.1, 2026-09-10). Nesse caso o Webhook 1 não dispara; o
 * agendamento segue normal pelo Webhook 2.
 */
export function isGhlReturnVisit(): boolean {
  const a = getAttribution() as Record<string, unknown>
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'gad_source', 'wbraid', 'gbraid']
  if (campaignKeys.some((k) => Boolean(a[k]))) return false
  const landing = typeof a.landing_url === 'string' ? a.landing_url : window.location.href
  return /[?&](full_name|email|phone)=/.test(landing)
}

/**
 * `source` é o rótulo da SUPERFÍCIE e entra como fallback, não como override: o
 * site institucional passa o dele para o CRM distinguir contato de site de
 * lead de anúncio, mas se a sessão tem sinal pago o `getSourceLabel` continua
 * mandando Meta/Google. Trocar a ordem perderia a atribuição de quem chega ao
 * site por anúncio.
 */
export function sendLeadWebhook(data: BookingData, source: string = SOURCE_LABEL): void {
  if (isGhlReturnVisit()) return
  if (!data.program) return
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
    program: data.program.name, // nome CRU do calendário no GHL (nunca o apelido) → campo Program do CRM
    audience: data.program.audience, // adults | kids, como veio do GHL → roteamento do workflow
    ...(cn ? { child_name: cn } : {}), // só quando há criança (kids)
    submittedAt: new Date().toISOString(),
    source: getSourceLabel(source), // dinâmico: Meta/Google quando há sinal pago
    // marketing attribution (só aqui) — espalha as chaves que vieram na URL
    ...getAttribution(),
  }
  void post(LEAD_WEBHOOK_URL, payload)
}

// -----------------------------------------------------------------------------
// Webhook 2 — Agendamento (destino: workflow n8n compartilhado) ⚠️ CONTRATO
// -----------------------------------------------------------------------------

export function sendBookingWebhook(data: BookingData, source: string = SOURCE_LABEL): void {
  if (!data.program || !data.date || !data.time) {
    console.warn('[webhook] booking sem programa/data/hora, ignorado')
    return
  }
  const cn = childNameOrNull(data)
  const payload = {
    parent_name: data.name, // responsável; o workflow split → first/last do contato
    ...(cn ? { child_name: cn } : {}), // só kids; adults omite → título cai no parent_name
    email: data.email,
    phone: data.phone, // formato exibido "(555) 555-5555" é aceito
    calendar_id: data.program.calendar_id, // casa o calendário no n8n (imune a rename)
    location_id: GHL_LOCATION_ID,
    stage: 'appointment_selected', // ignorado pelo workflow; valor fixo
    appointment_date: isoDate(data.date), // YYYY-MM-DD local
    appointment_time: formatTimeLabel(data.time), // h:mm AM/PM
    source, // campo JÁ EXISTENTE do contrato: muda o valor, nunca o conjunto
    // NADA de audience nem UTM aqui — contrato crítico do n8n (§3.2).
  }
  void post(BOOKING_WEBHOOK_URL, payload)
}

// -----------------------------------------------------------------------------
// Turmas + horários ao vivo — mesmo workflow n8n, action:"get_programs" (§5.1)
// -----------------------------------------------------------------------------

type RawProgram = {
  calendar_id?: string
  name?: string
  audience?: string
  duration_minutes?: number | null
  capacity?: number
  slots?: Record<string, unknown>
  slots_error?: string | null
}

/** Lista de ISOs → ["HH:MM"]. Cada ISO já traz o fuso da academia, então a
 *  hora local sai por string (slice), sem conversão de fuso (§5.1). */
function toSlotMap(raw: RawProgram['slots']): SlotMap {
  const map: SlotMap = {}
  for (const [date, value] of Object.entries(raw ?? {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(value)) continue
    const times = value
      .filter((s): s is string => typeof s === 'string')
      .map((iso) => iso.slice(11, 16)) // "2026-06-15T18:15:00-05:00" → "18:15"
      .filter((t) => /^\d{2}:\d{2}$/.test(t))
    if (times.length) map[date] = times
  }
  return map
}

/**
 * POST { action:"get_programs" } — a ÚNICA busca ao vivo (§5.1): programas e os
 * horários de todos juntos, uma vez por sessão (cache no módulo; a resposta já
 * vem ordenada, adultos primeiro). Diferente dos webhooks, esta chamada NÃO é
 * fire-and-forget: sem ela não há o que mostrar, então falha vira estado de
 * erro na tela (§2).
 */
let programsPromise: Promise<Program[]> | null = null

export function fetchPrograms(): Promise<Program[]> {
  if (!programsPromise) {
    programsPromise = (async () => {
      const res = await fetch(BOOKING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_programs', location_id: GHL_LOCATION_ID }),
      })
      if (!res.ok) throw new Error(`get_programs → HTTP ${res.status}`)
      const raw = (await res.json()) as { programs?: RawProgram[] }
      return (raw.programs ?? [])
        .filter((p): p is RawProgram & { calendar_id: string; name: string } =>
          Boolean(p.calendar_id && p.name),
        )
        .filter((p) => !PROGRAM_OVERRIDES[p.calendar_id]?.hide)
        .map((p) => ({
          calendar_id: p.calendar_id,
          name: p.name,
          audience: (p.audience === 'kids' ? 'kids' : 'adults') as Audience,
          duration_minutes: p.duration_minutes ?? null,
          capacity: p.capacity ?? 0,
          slots: toSlotMap(p.slots),
          slots_error: p.slots_error ?? null,
        }))
    })()
    programsPromise.catch(() => {
      programsPromise = null // falha não envenena o cache da sessão
    })
  }
  return programsPromise
}
