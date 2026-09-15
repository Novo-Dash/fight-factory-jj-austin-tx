/**
 * Trim to a length, on a word boundary.
 *
 * `line-clamp` is the usual answer and it is the wrong one here: it cuts
 * wherever the line happens to end, which lands mid-word ("both deliveri…")
 * and reads as broken rather than as trimmed. Cutting the string at a space
 * before it is rendered keeps every visible word whole, and the result is the
 * same at any viewport width instead of depending on where the line broke.
 */
export function clampWords(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  const kept = (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.]$/, '')
  return kept + '…'
}
