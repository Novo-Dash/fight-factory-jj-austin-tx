// =============================================================================
// analytics.ts — Tracking de conversão (Meta Pixel + CAPI + GA4 + Google Ads)
// -----------------------------------------------------------------------------
// Cada evento sai por UM caminho, pela tag da própria plataforma no código:
//   • fbq  → Meta Pixel (§7) — com a ÚNICA exceção controlada: todo evento do
//     Meta é espelhado server-side em /api/capi com o MESMO event_id, e a Meta
//     deduplica sozinha (§7.6). O espelho sai mesmo com o fbq bloqueado — é
//     exatamente o caso que ele cobre (ad-blocker/iOS).
//   • gtag → GA4 e Google Ads (§7-bis) — SEM espelho (Google não deduplica).
// SEM GTM no stack. Todos os helpers têm guarda: se a tag não carregou, viram
// no-op e NUNCA quebram o fluxo de lead/booking (fire-and-forget).
// =============================================================================

import { getFbc, getFbp } from './fb'

// Meta Pixel — o MESMO id do snippet base no index.html e do api/capi.ts.
export const PIXEL_ID = '4326414901006955'

// --- Alvos de conversão do Google Ads (vazio = no-op) ------------------------
const GOOGLE_ADS_ID = 'AW-18177687947'
export const GADS_LEAD = GOOGLE_ADS_ID ? `${GOOGLE_ADS_ID}/nG6XCNHClr4cEIuD5ttD` : ''
export const GADS_BOOKING = GOOGLE_ADS_ID ? `${GOOGLE_ADS_ID}/bWvTCJnblr4cEIuD5ttD` : ''

const CAPI_ENDPOINT = '/api/capi'

/** Último visitante identificado — enriquece os eventos espelhados seguintes.
 *  PII em claro só trafega até o endpoint first-party; o SHA-256 acontece lá
 *  (§7.6.4). */
let identified: { name?: string; email?: string; phone?: string } = {}

function newEventId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

// --- Meta Pixel + espelho CAPI ----------------------------------------------
/** Evento padrão do Meta: Pixel no browser + espelho /api/capi, MESMO event_id
 *  (§7.2/§7.6). O espelho sai mesmo se o fbq estiver bloqueado. */
export function fbqTrack(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const eventId = newEventId()
  if (typeof window.fbq === 'function') {
    window.fbq('track', event, params ?? {}, { eventID: eventId })
  }
  fetch(CAPI_ENDPOINT, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      event_id: eventId,
      params,
      url: window.location.href,
      fbp: getFbp(), // cookie _fbp (§7.6.3)
      fbc: getFbc(), // cookie _fbc ou fallback do fbclid (§7.6.3)
      user: identified, // Advanced Matching (§7.6.4)
    }),
  }).catch(() => {})
}

/** Advanced Matching (§7.6.4): guarda o visitante para os eventos espelhados
 *  seguintes e repassa os mesmos campos ao Pixel (o fbq hasheia no browser). */
export function identify(fields: { name?: string; email?: string; phone?: string }): void {
  identified = { ...identified, ...fields }
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  const data: Record<string, string> = {}
  if (fields.email) data.em = fields.email.trim().toLowerCase()
  if (fields.phone) {
    const digits = fields.phone.replace(/\D/g, '')
    if (digits) data.ph = digits.length === 10 ? `1${digits}` : digits
  }
  if (fields.name) {
    const parts = fields.name.trim().toLowerCase().split(/\s+/)
    if (parts[0]) data.fn = parts[0]
    if (parts.length > 1) data.ln = parts.slice(1).join(' ')
  }
  if (Object.keys(data).length > 0) window.fbq('init', PIXEL_ID, data)
}

// --- GA4 ---------------------------------------------------------------------
/** Evento GA4 via gtag. No-op se o gtag não carregou. */
export function ga4Event(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', event, params ?? {})
}

// --- Google Ads --------------------------------------------------------------
/** Conversão do Google Ads via gtag. No-op se não carregou ou sem rótulo. */
export function gtagConversion(sendTo: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  if (!sendTo) return // academia sem Google Ads
  window.gtag('event', 'conversion', { send_to: sendTo })
}

/**
 * Enhanced Conversions: dados do usuário (o gtag faz o hash sozinho). Setar uma
 * vez antes da conversão de Lead cobre as duas conversões da sessão. Inofensivo
 * se Enhanced Conversions não estiver ligado na ação do Google Ads.
 */
export function setUserData(email: string, phoneE164: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('set', 'user_data', { email, phone_number: phoneE164 })
}

// --- Funil: abertura do fluxo ------------------------------------------------
/** Dispara ViewContent (Meta) + view_content (GA4) ao abrir o modal / montar /book. */
export function trackViewContent(): void {
  fbqTrack('ViewContent', { content_name: 'Trial Booking' })
  ga4Event('view_content', { content_name: 'Trial Booking' })
}
