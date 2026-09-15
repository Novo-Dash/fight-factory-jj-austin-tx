// ═══════════════════════════════════════════════════════════════════════════
// types.ts — the shape of a post, and the helpers used to write one.
//
// The body is a list of typed blocks rather than a string of HTML. Two
// reasons, and both matter more than the extra typing:
//
//   1. It is what a headless CMS hands back. Sanity, Contentful, Storyblok and
//      a Supabase JSONB column all return blocks; mapping them onto this shape
//      is a `switch`, not a rewrite. See the README in this folder.
//   2. Nothing is ever passed to `dangerouslySetInnerHTML`. When the copy
//      starts coming from a CMS that a client edits, an unescaped paste cannot
//      turn into script on the page.
//
// Inline emphasis is written in a two-token subset of Markdown: `**bold**` and
// `[text](https://url)`. `PostBody` parses it into React elements.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * A post without its body: everything needed to list or link one.
 *
 * This is what the home page reads. Importing the full posts there would pull
 * every body into the landing surface's bundle to render three cards, and that
 * cost grows with every post published.
 */
export type PostSummary = Omit<Post, 'body' | 'draft'>

/** The three kinds of post. Adding one means adding it here and in CATEGORIES. */
export type Category = 'competition' | 'academy' | 'guide'

export interface Cover {
  src: string
  alt: string
  /** Intrinsic pixel size. Both are required: they reserve the box and keep CLS at zero. */
  w: number
  h: number
  /**
   * `object-position` for the crops that cannot keep the whole frame, such as
   * the wide lead slot on the index. Set it whenever the subject is not in the
   * middle of the picture: a portrait dropped into a wide box is cropped from
   * the centre by default, which takes the head off.
   */
  focus?: string
}

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'list'; items: string[] }

export interface Post {
  /** The URL: /blog/<slug>. Permanent once published, so keep it short. */
  slug: string
  title: string
  /** ISO date, YYYY-MM-DD. Drives the ordering and the dateline. */
  date: string
  category: Category
  /** One or two sentences. Used on the index, in <meta description> and on social cards. */
  excerpt: string
  cover: Cover
  body: Block[]
  /** Set while a post is still being checked. Kept out of the index and out of the sitemap. */
  draft?: boolean
}

/* ── Body helpers ─────────────────────────────────────────────────────────
   Write a post as p('...'), h('...'), list([...]). */

export const p = (text: string): Block => ({ kind: 'p', text })
export const h = (text: string): Block => ({ kind: 'h', text })
export const list = (items: string[]): Block => ({ kind: 'list', items })

/** How each category is labelled on the page. */
export const CATEGORIES: Record<Category, string> = {
  competition: 'Competition',
  academy: 'Academy',
  guide: 'Guides',
}
