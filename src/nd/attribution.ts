import type { Country } from './types'

const KEY = 'nd_attribution'
const RETURN_KEY = 'nd_ghl_return'
/** The gclid's own window. Safari cuts script storage at 7 days anyway. */
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000
const LANDING_URL_MAX = 1000
const PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'gad_source', 'wbraid', 'gbraid',
] as const
/** Contact data GHL puts in its links to prefill the form: never stored. */
const PREFILL = ['full_name', 'email', 'phone']

function clean(value: string | null) {
  const v = value?.trim()
  return v && !v.includes('{{') && !v.includes('}}') ? v : null
}

function fromUrl(): Record<string, string> {
  const out: Record<string, string> = {}
  const params = new URLSearchParams(window.location.search)
  for (const key of PARAMS) {
    const value = clean(params.get(key))
    if (value) out[key] = value
  }
  return out
}

function landingFromUrl(): Record<string, string> {
  const url = new URL(window.location.href)
  for (const key of PREFILL) url.searchParams.delete(key)
  const out: Record<string, string> = { landing_url: url.href.slice(0, LANDING_URL_MAX) }
  const referrer = clean(document.referrer)
  if (referrer) out.landing_referrer = referrer
  return out
}

/** A GHL link back to the site: the contact's data in the URL and no campaign. */
function isGhlLink() {
  const params = new URLSearchParams(window.location.search)
  return PREFILL.some((k) => params.has(k)) && !PARAMS.some((k) => clean(params.get(k)))
}

function read(): Record<string, string> | null {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { at: number; data: Record<string, string> } | null
    return stored && Date.now() - stored.at < MAX_AGE_MS ? stored.data : null
  } catch {
    return null
  }
}

/**
 * Last campaign touch wins, for 90 days, across tabs and visits: a URL with UTM or a
 * click id replaces what is stored (params and landing together); a visit without
 * them never erases it. The first visit is stored even without a campaign.
 */
export function captureAttribution() {
  try {
    if (isGhlLink()) sessionStorage.setItem(RETURN_KEY, '1')
    const params = fromUrl()
    if (Object.keys(params).length || !read()) {
      localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data: { ...params, ...landingFromUrl() } }))
    }
  } catch {
    /* private mode: attribution is best effort */
  }
}

export function getAttribution(): Record<string, string> {
  return read() ?? { ...fromUrl(), ...landingFromUrl() }
}

const META_SOURCES = new Set(['facebook', 'fb', 'instagram', 'ig', 'meta'])

/** fbclid or Meta utm_source -> Meta; gclid or google utm_source -> Google; else the page's label. */
export function getSourceLabel(fallback: string): string {
  const a = getAttribution()
  const utm = (a.utm_source ?? '').trim().toLowerCase()
  if (a.fbclid || META_SOURCES.has(utm)) return 'Landing Page - Meta Ads'
  if (a.gclid || utm.includes('google')) return 'Landing Page - Google'
  return fallback
}

/**
 * A contact already in the CRM, back from a GHL link with no campaign: Webhook 1 would
 * wipe its attribution and notify the academy again. Decided by this tab's arrival,
 * never by the stored landing, which may be weeks old.
 */
export function isGhlReturnVisit(): boolean {
  try {
    if (sessionStorage.getItem(RETURN_KEY)) return true
  } catch {
    /* storage blocked: the URL still tells */
  }
  return isGhlLink()
}

export function prefillFromUrl(country: Country = 'US') {
  const params = new URLSearchParams(window.location.search)
  return {
    fullName: clean(params.get('full_name')) ?? '',
    email: clean(params.get('email')) ?? '',
    phone: formatPhone(clean(params.get('phone')) ?? '', country),
  }
}

// Phone rules per academy.country. ponytail: US and GB only; a third country is one more branch in each helper.
export const PHONE_PLACEHOLDER: Record<Country, string> = { US: '(555) 555-0100', GB: '07123 456789' }
export const PHONE_ERROR: Record<Country, string> = {
  US: 'Please enter a 10 digit phone number.',
  GB: 'Please enter a valid UK phone number.',
}

/** UK digits without the trunk 0 or the 44: 9 or 10 of them ("07415 635940", "+44 7415 635940", "020 7946 0000"). */
const ukNational = (digits: string) => (digits.startsWith('44') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits)

export function isPhone(raw: string, country: Country = 'US') {
  const digits = raw.replace(/\D/g, '')
  if (country === 'GB') return /^\d{9,10}$/.test(ukNational(digits))
  return digits.length >= 10
}

export function formatPhone(raw: string, country: Country = 'US') {
  // GB: typed as they write it; GHL links bring E.164 (+44…), shown back in the national 0… form.
  if (country === 'GB') return raw.replace(/^\s*\+?44\s*/, '0').replace(/[^\d ]/g, '').slice(0, 14)
  const digits = raw.replace(/\D/g, '')
  const ten = (digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits).slice(0, 10)
  if (ten.length < 4) return ten
  if (ten.length < 7) return `(${ten.slice(0, 3)}) ${ten.slice(3)}`
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`
}

export function toE164(raw: string, country: Country = 'US') {
  const digits = raw.replace(/\D/g, '')
  if (country === 'GB') return digits ? `+44${ukNational(digits)}` : ''
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits ? `+${digits}` : ''
}
