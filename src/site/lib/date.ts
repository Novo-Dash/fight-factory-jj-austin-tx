/**
 * Dates for the blog.
 *
 * Parsed by hand rather than with `new Date('2026-08-06')`. That constructor
 * reads a bare ISO date as midnight UTC, and Austin is UTC-5 or UTC-6, so
 * every post would render one day early for the people it is written for.
 * Splitting the string keeps the date the author typed.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number)
  return [y, m, d]
}

/** "August 6, 2026" — the way the academy's own posts are dated. */
export function formatDate(iso: string): string {
  const [y, m, d] = parts(iso)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

/** "Aug 6, 2026", for tight metadata rows. */
export function formatDateShort(iso: string): string {
  const [y, m, d] = parts(iso)
  return `${SHORT[m - 1]} ${d}, ${y}`
}
