import { client, multi } from './config'
import type { Client } from './types'

// Meta Pixel + GA4 + Google Ads, no GTM. The base tags load in index.html
// (nd:tracking block); these helpers fire the funnel events. Every helper is a
// silent no-op without its id, and none can break the funnel.
// Multi-unit LP: every helper takes the unit's ids (default: the first unit) and
// fires only at them (trackSingle, send_to), since a visit can start two units.

type Params = Record<string, unknown>
export type User = { name?: string; email?: string; phone?: string }
type MetaEvent = 'ViewContent' | 'Lead' | 'Schedule' | 'Purchase' | { custom: string }
type Tracking = Client['tracking']

// Local view of the globals: LPs declare window.fbq / window.gtag their own way.
const w = window as unknown as { fbq?: (...args: unknown[]) => void; gtag?: (...args: unknown[]) => void; __ND?: Partial<Tracking> }

function cookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

// Ids the head block already started (the unit of the landing path).
const started = new Set([w.__ND?.pixel, w.__ND?.ga4, w.__ND?.ads].filter(Boolean))

/**
 * Multi-unit LP: a unit reached by in-app navigation (unit picker -> /quincy) starts
 * here, once per page load: pixel + PageView, GA4 page_view, Ads remarketing.
 * ponytail: the gtag library comes from the head; a landing unit with no Google id
 * leaves a later unit without it (none of the multi-unit LPs has such a unit).
 */
export function startUnit({ pixel, ga4, ads }: Tracking) {
  if (!multi) return
  try {
    if (pixel && !started.has(pixel)) {
      w.fbq?.('init', pixel)
      w.fbq?.('trackSingle', pixel, 'PageView')
    }
    for (const id of [ga4, ads]) if (id && !started.has(id)) w.gtag?.('config', id)
  } catch {
    /* never break the page */
  }
  for (const id of [pixel, ga4, ads]) if (id) started.add(id)
}

/** Browser Pixel + Conversions API mirror with the same event_id, so Meta counts it once.
 *  `{ custom: 'Name' }`: a non-standard event (trackCustom), for LP forms outside the funnel. */
export function fbTrack(ev: MetaEvent, params: Params = {}, user?: User, t: Tracking = client.tracking) {
  const { pixel } = t
  if (!pixel) return
  const custom = typeof ev !== 'string'
  const event = custom ? ev.custom : ev
  const eventId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  try {
    if (multi) {
      startUnit(t)
      w.fbq?.(custom ? 'trackSingleCustom' : 'trackSingle', pixel, event, params, { eventID: eventId })
    } else {
      w.fbq?.(custom ? 'trackCustom' : 'track', event, params, { eventID: eventId })
    }
  } catch {
    /* never break the funnel */
  }
  void fetch('/api/capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      event, event_id: eventId, pixel_id: pixel, params,
      url: window.location.href, fbp: cookie('_fbp'), fbc: cookie('_fbc'),
      ...(user ? { user } : {}),
    }),
  }).catch(() => {})
}

export function gaTrack(event: string, params: Params = {}, t: Tracking = client.tracking) {
  if (multi && !t.ga4) return
  try {
    w.gtag?.('event', event, multi ? { ...params, send_to: t.ga4 } : params)
  } catch {
    /* ignore */
  }
}

export function adsConversion(label: string, t: Tracking = client.tracking) {
  if (!t.ads || !label) return
  try {
    w.gtag?.('event', 'conversion', { send_to: `${t.ads}/${label}` })
  } catch {
    /* ignore */
  }
}

/** Meta Advanced Matching + Google Enhanced Conversions, before the Lead fires. */
export function identify(user: Required<User>, t: Tracking = client.tracking) {
  try {
    if (t.pixel) {
      const [first, ...rest] = user.name.trim().toLowerCase().split(/\s+/)
      w.fbq?.('init', t.pixel, {
        em: user.email.trim().toLowerCase(),
        ph: user.phone.replace(/\D/g, ''),
        fn: first ?? '',
        ln: rest.join(' '),
      })
    }
    w.gtag?.('set', 'user_data', { email: user.email, phone_number: user.phone })
  } catch {
    /* ignore */
  }
}
