import { BOOKING_WEBHOOK, client } from './config'
import type { Audience } from './types'

// Classes and open times, live from GHL through the shared n8n flow. Nothing
// about the class list is written by hand: a class added, renamed or paused in
// GHL shows up on the next load.

export type Program = {
  calendar_id: string
  /** GHL calendar name; this exact string travels on Webhook 1. */
  name: string
  /** Routing for the CRM (adults | kids), and what turns on the child's name field. */
  audience: Audience
  /** GHL calendar group; the picker's sections come from it. */
  group: string | null
  /** "YYYY-MM-DD" -> ["HH:MM"], in the academy's timezone. */
  slots: Record<string, string[]>
}

const { programOverrides, retiredSlots } = client.booking
const retired = new Set(retiredSlots)

// Each ISO carries the academy's offset: slice the text, never go through Date.
function normalizeSlots(raw: unknown, calendarId: string): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [day, value] of Object.entries((raw ?? {}) as Record<string, unknown>)) {
    const list = Array.isArray(value) ? value : (value as { slots?: unknown[] })?.slots
    if (!Array.isArray(list)) continue
    const times = list
      .filter((iso): iso is string => typeof iso === 'string' && iso.slice(0, 10) === day)
      .map((iso) => iso.slice(11, 16))
      .filter((t) => !retired.has(`${calendarId}|${t}`))
      .sort()
    if (times.length) out[day] = times
  }
  return out
}

let inflight: Promise<Program[]> | null = null

/** Once per session, shared by every consumer (modal, /book, schedule grids). */
export function fetchPrograms(audience: Audience | null = client.booking.audience): Promise<Program[]> {
  inflight ??= load().catch((err) => {
    inflight = null
    throw err
  })
  return inflight.then((all) => {
    const narrowed = audience ? all.filter((p) => p.audience === audience) : all
    return narrowed.length ? narrowed : all
  })
}

async function load(): Promise<Program[]> {
  if (!client.ghl.locationId) return []
  const res = await fetch(BOOKING_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_programs', location_id: client.ghl.locationId }),
  })
  if (!res.ok) throw new Error(`get_programs responded ${res.status}`)
  const { programs } = (await res.json()) as { programs?: Array<Record<string, unknown>> }
  return (Array.isArray(programs) ? programs : [])
    .filter((p) => typeof p.calendar_id === 'string' && typeof p.name === 'string')
    .filter((p) => !programOverrides[p.calendar_id as string]?.hide)
    .map((p) => ({
      calendar_id: p.calendar_id as string,
      name: p.name as string,
      audience: p.audience === 'kids' ? 'kids' : 'adults',
      group: typeof p.group === 'string' && p.group.trim() ? p.group.trim() : null,
      slots: normalizeSlots(p.slots, p.calendar_id as string),
    }))
}

/** Display label only; webhooks carry the raw GHL name. */
export function labelOf(calendarId: string, name: string) {
  return programOverrides[calendarId]?.label ?? name
}

export function shortName(p: Program) {
  return labelOf(p.calendar_id, p.name).replace(/\s*\([^)]*\)\s*/g, ' ').trim()
}

/** "Little Champions (4-6 years old)" -> "4-6 years old". */
export function ageHint(p: Program) {
  return p.name.match(/\(([^)]*\d[^)]*)\)/)?.[1] ?? null
}

const GROUP_ORDER = [/adult/i, /kid|teen|youth|champion/i]

export function groupPrograms(programs: Program[]) {
  const groups = new Map<string, { label: string; programs: Program[]; seen: number }>()
  for (const p of programs) {
    const label = (p.group ?? '').replace(/\bcalendars?\b/gi, '').replace(/^[\s–—-]+|[\s–—-]+$/g, '').trim()
      || (p.audience === 'kids' ? 'Kids' : 'Adults')
    const g = groups.get(label.toLowerCase()) ?? { label, programs: [], seen: groups.size }
    g.programs.push(p)
    groups.set(label.toLowerCase(), g)
  }
  const rank = (label: string) => {
    const i = GROUP_ORDER.findIndex((re) => re.test(label))
    return i === -1 ? GROUP_ORDER.length : i
  }
  return [...groups.values()].sort((a, b) => rank(a.label) - rank(b.label) || a.seen - b.seen)
}

// Local date helpers. Never toISOString: UTC would shift the day.
export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parseKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const longDate = (key: string) =>
  parseKey(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
/** "17:30" -> "5:30 PM": the exact format Webhook 2 expects. */
export function timeLabel(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}
