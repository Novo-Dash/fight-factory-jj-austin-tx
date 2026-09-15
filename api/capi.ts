/* Vercel serverless function: mirrors the Pixel events into the Meta
   Conversions API, deduplicated by the event_id generated in the browser
   (src/booking/analytics.ts). Requires the META_CAPI_ACCESS_TOKEN env var on
   the Vercel project (agency-wide token, §7.6.2).
   Optional: META_TEST_EVENT_CODE to validate in Events Manager > Test Events. */

import { createHash } from 'node:crypto'

/* Same pixel as index.html and src/booking/analytics.ts. */
const PIXEL_ID = '4326414901006955'
const GRAPH_URL = `https://graph.facebook.com/v23.0/${PIXEL_ID}/events`

type CapiBody = {
  event?: string
  event_id?: string
  params?: Record<string, unknown>
  url?: string
  fbp?: string
  fbc?: string
  user?: { name?: string; email?: string; phone?: string }
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/* Meta-required normalizations (§7.6.1): em = trim+lowercase; ph = digits
   only, 10-digit numbers get the "1" country code (NO "+"); fn/ln = lowercase
   name split. Same rules as identify() in src/booking/analytics.ts. */
function hashedUserData(user: CapiBody['user']): Record<string, string[]> {
  const data: Record<string, string[]> = {}
  if (user?.email) data.em = [sha256(user.email.trim().toLowerCase())]
  if (user?.phone) {
    const digits = user.phone.replace(/\D/g, '')
    if (digits) data.ph = [sha256(digits.length === 10 ? `1${digits}` : digits)]
  }
  if (user?.name) {
    const parts = user.name.trim().toLowerCase().split(/\s+/)
    if (parts[0]) data.fn = [sha256(parts[0])]
    if (parts.length > 1) data.ln = [sha256(parts.slice(1).join(' '))]
  }
  return data
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(
  req: {
    method?: string
    body?: CapiBody
    headers?: Record<string, string | string[] | undefined>
  },
  res: {
    status: (code: number) => { json: (body: unknown) => void }
    setHeader: (name: string, value: string) => void
  },
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body: CapiBody = req.body ?? {}
  if (!body.event || !body.event_id) {
    res.status(400).json({ error: 'Missing event or event_id' })
    return
  }

  /* Without the token the client-side tracking still works — answer ok, log. */
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN
  if (!accessToken) {
    console.warn('capi: META_CAPI_ACCESS_TOKEN is not configured, event dropped')
    res.status(200).json({ ok: false })
    return
  }

  const ip = firstHeader(req.headers?.['x-forwarded-for'])?.split(',')[0]?.trim()
  const userAgent = firstHeader(req.headers?.['user-agent'])

  const userData: Record<string, unknown> = hashedUserData(body.user)
  if (ip) userData.client_ip_address = ip
  if (userAgent) userData.client_user_agent = userAgent
  if (body.fbp) userData.fbp = body.fbp
  if (body.fbc) userData.fbc = body.fbc

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: body.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.event_id,
        event_source_url: body.url,
        action_source: 'website',
        user_data: userData,
        custom_data: body.params ?? {},
      },
    ],
  }
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE
  }

  /* A Meta failure must never become an LP error — log and answer ok anyway. */
  try {
    const response = await fetch(`${GRAPH_URL}?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      console.error('capi: Meta rejected event', body.event, await response.text())
    }
  } catch (err) {
    console.error('capi: request to Meta failed', err)
  }

  res.status(200).json({ ok: true })
}
