// =============================================================================
// attribution.ts — Captura de marketing attribution (UTM + ad click IDs)
// -----------------------------------------------------------------------------
// Captura os params da URL de chegada, persiste na sessão (first-touch) e
// devolve para o Webhook 1 (lead → GHL). NUNCA vai no Webhook 2.
// Lógica idêntica entre academias.
// =============================================================================

// 5 UTMs padrão + ad click IDs usados para conversão offline.
const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'gad_source',
  'wbraid',
  'gbraid',
] as const

const STORAGE_KEY = 'ff_attribution'
const LANDING_KEY = 'ff_landing'
const LANDING_URL_MAX = 1000

/** Lê os params válidos da URL atual (ignora merge tags não resolvidas e vazios). */
function readFromUrl(): Record<string, string> {
  const params = new URLSearchParams(window.location.search)
  const out: Record<string, string> = {}
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key)
    if (value && !value.includes('{{') && !value.includes('}}')) {
      out[key] = value
    }
  }
  return out
}

/** landing_url (SEMPRE, com query string, cortada pelo fim) + referrer. */
function readLanding(): Record<string, string> {
  const out: Record<string, string> = {}
  out.landing_url = window.location.href.slice(0, LANDING_URL_MAX)
  const ref = document.referrer
  if (ref && !ref.includes('{{') && !ref.includes('}}')) {
    out.landing_referrer = ref
  }
  return out
}

/**
 * Captura no boot do app (main.tsx), ANTES de a navegação SPA limpar a query.
 * First-touch sem clobber: só grava se ainda não há nada salvo E a URL traz
 * ≥ 1 param. landing_url/referrer gravam na primeira visita da sessão MESMO
 * sem param (rastro do tráfego que perdeu a UTM). Falha de storage é
 * silenciosa (modo privado / bloqueado).
 */
export function captureAttribution(): void {
  try {
    if (!sessionStorage.getItem(LANDING_KEY)) {
      sessionStorage.setItem(LANDING_KEY, JSON.stringify(readLanding()))
    }
  } catch {
    // storage indisponível — ignora, getAttribution() cai pra leitura direta da URL
  }
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return // first-touch: não sobrescreve
    const fromUrl = readFromUrl()
    if (Object.keys(fromUrl).length === 0) return // sem params → não grava (tráfego direto)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl))
  } catch {
    // storage indisponível — ignora, getAttribution() cai pra leitura direta da URL
  }
}

/**
 * Devolve a atribuição persistida (ou, em fallback, a da URL atual) junto com
 * landing_url/landing_referrer. Visita sem campanha → só o bloco landing.
 */
export function getAttribution(): Record<string, string> {
  let params: Record<string, string> | null = null
  let landing: Record<string, string> | null = null
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) params = JSON.parse(stored)
  } catch {
    // fall-through para leitura direta da URL
  }
  try {
    const stored = sessionStorage.getItem(LANDING_KEY)
    if (stored) landing = JSON.parse(stored)
  } catch {
    // idem
  }
  const out: Record<string, string> = {
    ...(params ?? readFromUrl()),
    ...(landing ?? readLanding()),
  }
  if (out.landing_url) out.landing_url = out.landing_url.slice(0, LANDING_URL_MAX)
  return out
}

const META_SOURCES = new Set(['facebook', 'fb', 'instagram', 'ig', 'meta'])

/**
 * Source do contato no CRM, dinâmico pela atribuição (regra da operação):
 * fbclid ou utm_source de Meta → "Landing Page - Meta Ads"; gclid ou
 * utm_source google (QUALQUER medium, GMB conta como Google) →
 * "Landing Page - Google". Sem sinal pago, cai no rótulo padrão da academia.
 */
export function getSourceLabel(fallback: string): string {
  const a = getAttribution()
  const utm = (a.utm_source ?? '').trim().toLowerCase()
  if (a.fbclid || META_SOURCES.has(utm)) return 'Landing Page - Meta Ads'
  if (a.gclid || utm.includes('google')) return 'Landing Page - Google'
  return fallback
}
