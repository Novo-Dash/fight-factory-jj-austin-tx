// ═══════════════════════════════════════════════════════════════════════════
// index.ts — the only place the rest of the site asks about posts.
//
// ⭐ THIS FILE IS THE SEAM. Every page reads posts through the four functions
// at the bottom and knows nothing about where they come from. Moving to a CMS
// later means rewriting `load()` here and leaving every page untouched. The
// README in this folder spells that out step by step.
//
// Publishing today needs no edit to this file: `import.meta.glob` picks up
// anything in ./posts, so dropping a new file in that folder IS publishing it.
// Nobody has to remember to register a post, which is the step a human forgets.
// ═══════════════════════════════════════════════════════════════════════════

import type { Category, Post } from './types'

/**
 * Every post file in ./posts, pulled in at build time.
 *
 * `eager` is deliberate: the posts are text, the whole set compresses to a few
 * kilobytes, and it keeps the index page free of a loading state that would
 * otherwise flash on every visit. If this ever grows past a few hundred posts,
 * the fix is to split the metadata from the body and lazy-load the body by
 * slug. It is not worth the complexity before then.
 */
const modules = import.meta.glob<{ post: Post }>('./posts/*.ts', { eager: true })

function load(): Post[] {
  const all = Object.entries(modules).map(([file, mod]) => {
    if (!mod?.post) throw new Error(`${file} does not export a \`post\``)
    return mod.post
  })

  // A duplicate slug would mean two posts fighting over one URL, and the build
  // would quietly emit whichever came last. Fail loudly instead.
  const seen = new Set<string>()
  for (const post of all) {
    if (seen.has(post.slug)) throw new Error(`Two posts share the slug "${post.slug}"`)
    seen.add(post.slug)
  }

  return all
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

const POSTS = load()

/* ── The four questions the site asks ──────────────────────────────────── */

/** Newest first. Drafts are already gone. */
export function allPosts(): Post[] {
  return POSTS
}

export function postBySlug(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug)
}

/** Only the categories that actually have a post, so the filter never offers an empty view. */
export function usedCategories(): Category[] {
  const order: Category[] = ['competition', 'academy', 'guide']
  return order.filter((category) => POSTS.some((post) => post.category === category))
}

/**
 * What to read next. Same category first, then whatever is newest, never the
 * post being read. Falling back to newest matters: without it, the only post
 * in a category ends with an empty rail.
 */
export function relatedPosts(post: Post, count = 3): Post[] {
  const others = POSTS.filter((candidate) => candidate.slug !== post.slug)
  const sameCategory = others.filter((candidate) => candidate.category === post.category)
  const rest = others.filter((candidate) => candidate.category !== post.category)
  return [...sameCategory, ...rest].slice(0, count)
}

export type { Post, Category } from './types'
export { CATEGORIES } from './types'
