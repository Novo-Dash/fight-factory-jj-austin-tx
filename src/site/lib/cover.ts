import type { Cover } from '../content/blog/types'

/**
 * The aspect ratio a cover is shown at on the index.
 *
 * Each picture keeps its own proportions, because forcing one crop on a set
 * that mixes tournament collages with phone portraits cuts the subject out of
 * half of them. But the range is clamped: the archive runs from a 2.94:1
 * banner to a 0.71:1 portrait, and left alone those two sit side by side in a
 * two-column grid with one card three times the height of the other, which
 * reads as a broken layout rather than as rhythm.
 *
 * The bounds are a portrait no taller than 5:4 and a landscape no wider than
 * 16:9, so the variation stays visible and the grid stays level.
 */
const NARROWEST = 0.8 // 4:5, portrait
const WIDEST = 1.78 // 16:9, landscape

export function coverRatio(cover: Cover): number {
  const natural = cover.w / cover.h
  return Math.min(WIDEST, Math.max(NARROWEST, natural))
}

/** Ready for a `style` prop: the clamped ratio plus any explicit focal point. */
export function coverStyle(cover: Cover): React.CSSProperties {
  return {
    aspectRatio: String(coverRatio(cover)),
    ...(cover.focus ? { objectPosition: cover.focus } : {}),
  }
}
