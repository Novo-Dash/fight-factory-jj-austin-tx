import { Fragment, type ReactNode } from 'react'
import type { Block } from '../content/blog/types'
import { Diamond } from './ui'
import { Reveal } from './motion'

/* ── Inline emphasis ──────────────────────────────────────────────────────
   Post copy is written with two Markdown tokens and nothing else: `**bold**`
   and `[text](url)`. They are parsed into React elements here.

   Parsed, not injected. The copy will eventually come from a CMS that someone
   outside this repo edits, and `dangerouslySetInnerHTML` would turn a pasted
   `<script>` into a running one. React escapes every string it renders, so the
   worst a bad paste can do on this path is look wrong. */

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g

function inline(text: string): ReactNode {
  const out: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  INLINE.lastIndex = 0
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index))

    if (match[1] !== undefined) {
      out.push(<strong key={key++}>{match[1]}</strong>)
    } else {
      const href = match[3]
      const external = /^https?:\/\//.test(href)
      out.push(
        <a
          key={key++}
          href={href}
          className="post-link"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {match[2]}
        </a>,
      )
    }
    last = match.index + match[0].length
  }

  if (last < text.length) out.push(text.slice(last))
  return out.map((node, i) => <Fragment key={i}>{node}</Fragment>)
}

/* ── The body ─────────────────────────────────────────────────────────────
   One measure, one rhythm. Headings are set in the display width so a post
   reads as the same document as the page it sits on, and list markers use the
   logo diamond rather than a bullet, which is the device the rest of the site
   uses wherever an item needs marking. */

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="post-measure">
      {blocks.map((block, i) => {
        /* The spacing lives on the wrapper, not on the heading or the
           paragraph inside it.
           Every block gets its own Reveal element, which makes every heading
           and every paragraph the FIRST child of its own wrapper. A `first:`
           variant on the inner element therefore matches all of them and
           flattens the whole article into one undifferentiated column. Spacing
           the wrappers keeps the rhythm and still lets the first block sit
           tight against the top. */
        const gap = i === 0 ? '' : block.kind === 'h' ? 'mt-14 md:mt-16' : 'mt-6'

        if (block.kind === 'h') {
          return (
            <Reveal key={i} className={gap}>
              <h2 className="display-line text-[1.32rem] text-ink md:text-[1.5rem]">{block.text}</h2>
            </Reveal>
          )
        }

        if (block.kind === 'list') {
          return (
            <Reveal key={i} className={gap}>
              <ul className="grid gap-2.5">
                {block.items.map((item, k) => (
                  <li key={k} className="t-body flex gap-3.5 text-ink">
                    <Diamond className="mt-[0.62em] shrink-0 text-red" />
                    <span>{inline(item)}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )
        }

        return (
          <Reveal key={i} className={gap}>
            <p className="t-body text-body">{inline(block.text)}</p>
          </Reveal>
        )
      })}
    </div>
  )
}
