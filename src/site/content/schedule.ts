// ═══════════════════════════════════════════════════════════════════════════
// schedule.ts — the academy's real weekly class grid.
//
// Two authoritative sources, merged:
//   • ADULT classes come from the academy's own live schedule app (Rollpay),
//     the same feed the old site embedded on /schedule.
//   • KIDS classes come from the academy's printed schedule poster, and every
//     time on it matches the open hours of the kids calendars in the client's
//     GHL sub-account — so the two agree.
//
// ⚠️ One difference between the two sources is flagged on the page rather than
// silently resolved: the printed poster shows Saturday as a single 10:30 AM –
// 12:30 PM Gi class, while the live app shows 9:30 AM Women's + 11:00 AM Gi.
// The live app is the newer of the two, so it is what the grid shows.
// ═══════════════════════════════════════════════════════════════════════════

/** Class families. Drives the filter and the legend — never colour alone. */
export type Track = 'gi' | 'nogi' | 'kids' | 'womens' | 'wrestling'

export interface ClassSlot {
  /** 1 = Monday … 6 = Saturday. The academy is closed on Sundays. */
  day: number
  start: string
  end: string
  name: string
  track: Track
  /** Belt or age qualifier, shown under the class name. */
  note?: string
}

export const TRACKS: { id: Track; label: string; short: string }[] = [
  { id: 'gi', label: 'Gi', short: 'Gi' },
  { id: 'nogi', label: 'No-Gi', short: 'No-Gi' },
  { id: 'kids', label: 'Kids', short: 'Kids' },
  { id: 'womens', label: "Women's", short: "Women's" },
  { id: 'wrestling', label: 'Wrestling', short: 'Wrestling' },
]

export const DAYS = [
  { n: 1, label: 'Monday', short: 'Mon' },
  { n: 2, label: 'Tuesday', short: 'Tue' },
  { n: 3, label: 'Wednesday', short: 'Wed' },
  { n: 4, label: 'Thursday', short: 'Thu' },
  { n: 5, label: 'Friday', short: 'Fri' },
  { n: 6, label: 'Saturday', short: 'Sat' },
]

export const SLOTS: ClassSlot[] = [
  // ── Monday ─────────────────────────────────────────────────────────────
  { day: 1, start: '7:00 AM', end: '8:00 AM', name: 'Gi', track: 'gi', note: 'All levels' },
  { day: 1, start: '11:00 AM', end: '12:00 PM', name: 'Wrestling', track: 'wrestling' },
  { day: 1, start: '4:30 PM', end: '5:15 PM', name: 'Kids Gi', track: 'kids', note: 'Ages 4–6' },
  { day: 1, start: '5:15 PM', end: '6:00 PM', name: 'Kids Gi', track: 'kids', note: 'Ages 7–12' },
  { day: 1, start: '6:15 PM', end: '7:15 PM', name: 'Gi', track: 'gi', note: 'White & blue' },
  { day: 1, start: '7:15 PM', end: '8:15 PM', name: 'Gi', track: 'gi', note: 'Blue & above' },

  // ── Tuesday ────────────────────────────────────────────────────────────
  { day: 2, start: '7:00 AM', end: '8:00 AM', name: 'No-Gi', track: 'nogi', note: 'All levels' },
  { day: 2, start: '11:00 AM', end: '12:00 PM', name: 'No-Gi', track: 'nogi', note: 'All levels' },
  { day: 2, start: '12:30 PM', end: '1:30 PM', name: "Women's Class", track: 'womens' },
  { day: 2, start: '5:00 PM', end: '6:00 PM', name: 'Kids No-Gi', track: 'kids', note: 'Ages 8+' },
  { day: 2, start: '6:15 PM', end: '7:15 PM', name: 'No-Gi', track: 'nogi', note: 'White & blue' },
  { day: 2, start: '7:15 PM', end: '8:30 PM', name: 'No-Gi', track: 'nogi', note: 'Blue & above' },

  // ── Wednesday ──────────────────────────────────────────────────────────
  { day: 3, start: '7:00 AM', end: '8:00 AM', name: 'No-Gi', track: 'nogi', note: 'All levels' },
  { day: 3, start: '11:00 AM', end: '12:00 PM', name: 'Gi', track: 'gi', note: 'All levels' },
  { day: 3, start: '4:30 PM', end: '5:15 PM', name: 'Kids Gi', track: 'kids', note: 'Ages 4–6' },
  { day: 3, start: '5:15 PM', end: '6:00 PM', name: 'Kids Gi', track: 'kids', note: 'Ages 7–12' },
  { day: 3, start: '6:15 PM', end: '7:15 PM', name: 'Gi', track: 'gi', note: 'White & blue' },
  { day: 3, start: '7:15 PM', end: '8:15 PM', name: 'Gi', track: 'gi', note: 'Blue & above' },

  // ── Thursday ───────────────────────────────────────────────────────────
  { day: 4, start: '7:00 AM', end: '8:00 AM', name: 'Gi', track: 'gi', note: 'All levels' },
  { day: 4, start: '11:00 AM', end: '12:00 PM', name: 'No-Gi', track: 'nogi', note: 'All levels' },
  { day: 4, start: '12:30 PM', end: '1:30 PM', name: "Women's Class", track: 'womens' },
  { day: 4, start: '4:30 PM', end: '5:15 PM', name: 'Kids Gi', track: 'kids', note: 'Ages 4–6' },
  { day: 4, start: '5:15 PM', end: '6:00 PM', name: 'Kids No-Gi', track: 'kids', note: 'Ages 7–12' },
  { day: 4, start: '6:15 PM', end: '7:15 PM', name: 'Gi', track: 'gi', note: 'All levels' },
  { day: 4, start: '7:15 PM', end: '8:15 PM', name: 'No-Gi', track: 'nogi', note: 'All levels' },

  // ── Friday ─────────────────────────────────────────────────────────────
  { day: 5, start: '11:00 AM', end: '12:00 PM', name: 'Gi', track: 'gi', note: 'All levels' },
  { day: 5, start: '5:15 PM', end: '6:15 PM', name: 'Gi', track: 'gi', note: 'White belts only' },
  { day: 5, start: '6:15 PM', end: '7:15 PM', name: 'No-Gi', track: 'nogi', note: 'All levels' },

  // ── Saturday ───────────────────────────────────────────────────────────
  { day: 6, start: '9:30 AM', end: '10:30 AM', name: "Women's Class", track: 'womens' },
  { day: 6, start: '11:00 AM', end: '12:00 PM', name: 'Gi', track: 'gi', note: 'All levels' },
]

/** Sort key so a day column reads chronologically regardless of source order. */
export function minutesOf(t: string): number {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim())
  if (!m) return 0
  let h = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return h * 60 + Number(m[2])
}

export function slotsForDay(day: number, tracks: Track[] | null): ClassSlot[] {
  return SLOTS.filter((s) => s.day === day && (!tracks || tracks.includes(s.track))).sort(
    (a, b) => minutesOf(a.start) - minutesOf(b.start),
  )
}

/** Total weekly class count — quoted on the schedule page, never hard-coded. */
export const WEEKLY_CLASS_COUNT = SLOTS.length
