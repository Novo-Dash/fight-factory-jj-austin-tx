import raw from './client'
import type { Client } from './types'

/**
 * Multi-unit LP (one repo, several GHL sub-accounts): client.ts exports { units: { <key>: Client } }.
 * A one-academy LP keeps the flat client.ts; it is the only unit.
 */
const data = raw as unknown as Client & { units?: Record<string, Client> }
export const units: Record<string, Client> = data.units ?? { main: data }
export const multi = Object.keys(units).length > 1

/** The first unit: what every page without a `unit` prop uses (a one-academy LP: the academy). */
export const client = Object.values(units)[0]

/** Unit by key; no key, the first. A mistyped key would book into another academy: fail loud instead. */
export function unitOf(key?: string): Client {
  if (!key) return client
  const u = units[key]
  if (!u) throw new Error(`nd: unit "${key}" not in client.ts (${Object.keys(units).join(', ')})`)
  return u
}

const defaultCopy = {
  eyebrow: 'Free trial class',
  panelTitle: 'Your first class is on us',
  panelText: 'Pick your class, choose a day and time, and your spot on the mats is set.',
  bullets: ['Your first class is 100% free', 'No experience needed', 'All levels welcome'],
  proof: '',
  formTitle: 'Book your free class',
  formText: 'No commitment. No experience required.',
  confirm: 'Confirm my free class',
  /** Consent line under the step 1 button, when the LP had one ("By submitting, you agree to be contacted..."). */
  consent: '',
  submit: '',
  doneTitle: 'We have your request',
  doneText: 'Our team will reach out shortly.',
  /** Paid trial (`payment` on the page): title of the checkout step. */
  payTitle: 'Secure your spot',
  /** "Before you come in" on the confirmation; the academy's own when it differs (uniform provided...). */
  tips: ['Wear a t-shirt and shorts', 'Bring water', 'Arrive a few minutes early so someone can show you around'],
}
export const copyOf = (c: Client) => ({ ...defaultCopy, ...c.copy })
export const copy = copyOf(client)
export type Copy = typeof copy

/** Classes and open starts: the Novo Dash app, straight (public, read-only, CDN-cached 60 s). */
export const PROGRAMS_URL = 'https://clients.novodash.com/api/public/programs'

/** Webhook 2: the shared n8n flow, fixed for every academy. */
export const BOOKING_WEBHOOK = 'https://n8n.novodash.com/webhook/landing-page-booking'

/** Webhook 1: the [ND] Primary Workflow inbound trigger of the academy's sub-account. */
export const leadWebhookOf = (c: Client) =>
  c.ghl.locationId && c.ghl.leadWebhookUuid
    ? `https://services.leadconnectorhq.com/hooks/${c.ghl.locationId}/webhook-trigger/${c.ghl.leadWebhookUuid}`
    : ''
export const LEAD_WEBHOOK = leadWebhookOf(client)
