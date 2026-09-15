import { useEffect, useRef } from 'react'
import { useModal } from '../../hooks/useModal'
import { MaskHeading } from '../components/MaskHeading'
import { PostBody } from '../components/PostBody'
import { Reveal, Uncover } from '../components/motion'
import { Btn, Diamond, Rule } from '../components/ui'
import { Icon } from '../components/Icon'
import { CATEGORIES, relatedPosts, type Post } from '../content/blog'
import { formatDate, formatDateShort } from '../lib/date'
import { coverStyle } from '../lib/cover'

/* ── Reading progress ─────────────────────────────────────────────────────
   The one piece of motion added for this page, and it earns it: a post runs
   well past a screen, and the bar answers "how much is left" without the
   reader having to drag the scrollbar to find out.

   Written straight to the element, never through state. A scroll handler that
   calls setState re-renders the whole article on every frame, which is exactly
   how a page like this starts dropping frames on a phone. */

function ReadingProgress({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = bar.current
    const article = target.current
    if (!el || !article) return

    let frame = 0
    const run = () => {
      frame = 0
      const start = article.offsetTop
      const span = article.offsetHeight - window.innerHeight
      const progress = span <= 0 ? 1 : (window.scrollY - start) / span
      el.style.transform = `scaleX(${Math.max(0, Math.min(1, progress)).toFixed(4)})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(run)
    }

    run()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [target])

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-40 h-[2px] bg-transparent">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-red" />
    </div>
  )
}

/** Roughly how long the post takes to read. Derived from the copy, not typed in. */
function readingMinutes(post: Post): number {
  const words = post.body.reduce((total, block) => {
    const text = block.kind === 'list' ? block.items.join(' ') : block.text
    return total + text.split(/\s+/).length
  }, 0)
  return Math.max(1, Math.round(words / 220))
}

function Related({ post }: { post: Post }) {
  const posts = relatedPosts(post, 3)
  if (posts.length === 0) return null

  return (
    <section className="wrap pb-24 md:pb-32">
      <Rule />
      <h2 className="label mt-7 text-muted">Keep reading</h2>
      <div className="mt-9 grid grid-cols-1 gap-x-8 gap-y-11 sm:grid-cols-3 md:gap-x-10">
        {posts.map((item) => (
          <Reveal as="article" key={item.slug}>
            <a href={`/blog/${item.slug}`} className="group block">
              <div className="overflow-hidden bg-shell-2">
                <img
                  src={item.cover.src}
                  alt={item.cover.alt}
                  width={item.cover.w}
                  height={item.cover.h}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              </div>
              <span className="label-sm nums mt-4 flex items-center gap-2.5 text-muted">
                <span className="text-red">{CATEGORIES[item.category]}</span>
                <Diamond className="text-rule" />
                <time dateTime={item.date}>{formatDateShort(item.date)}</time>
              </span>
              <h3 className="display-line mt-3 text-[1.02rem] text-ink transition-colors duration-200 group-hover:text-red">
                {item.title}
              </h3>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/** True when the excerpt is just the opening line repeated back. */
function excerptAddsNothing(post: Post): boolean {
  const first = post.body.find((block) => block.kind === 'p')
  if (!first || first.kind !== 'p') return false
  const strip = (s: string) =>
    s.replace(/\*+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim().toLowerCase()
  return strip(first.text).startsWith(strip(post.excerpt).slice(0, 60))
}

export function PostPage({ post }: { post: Post }) {
  const { openModal } = useModal()
  const article = useRef<HTMLElement>(null)

  return (
    <>
      <ReadingProgress target={article} />

      <article ref={article}>
        <header className="wrap pt-12 md:pt-16">
          <Reveal>
            <a
              href="/blog"
              className="label inline-flex items-center gap-2.5 text-muted transition-colors duration-200 hover:text-ink"
            >
              <Icon name="arrow" size={15} className="rotate-180" />
              All posts
            </a>
          </Reveal>

          <Reveal delay={60}>
            <span className="label-sm nums mt-9 flex flex-wrap items-center gap-2.5 text-muted">
              <span className="text-red">{CATEGORIES[post.category]}</span>
              <Diamond className="text-rule" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <Diamond className="text-rule" />
              <span>{readingMinutes(post)} min read</span>
            </span>
          </Reveal>

          <MaskHeading as="h1" text={post.title} className="t-mega mt-5 max-w-[19ch]" />

          {excerptAddsNothing(post) ? null : (
            <Reveal delay={120}>
              <p className="standfirst mt-6 max-w-2xl text-body">{post.excerpt}</p>
            </Reveal>
          )}
        </header>

        <figure className="wrap mt-11 md:mt-14">
          <Uncover>
            <div className="overflow-hidden bg-shell-2">
              <img
                src={post.cover.src}
                alt={post.cover.alt}
                width={post.cover.w}
                height={post.cover.h}
                loading="eager"
                fetchPriority="high"
                /* Its own proportions up to a ceiling, so a tall portrait
                   cannot push the first paragraph off the screen. */
                className="max-h-[68vh] w-full object-cover"
                style={coverStyle(post.cover)}
              />
            </div>
          </Uncover>
        </figure>

        <div className="wrap mt-12 md:mt-16">
          <PostBody blocks={post.body} />
        </div>

        {/* The single call to action on the page, and it is the form. */}
        <div className="wrap mt-16 md:mt-20">
          <div className="post-measure">
            <Rule />
            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="t-body max-w-sm text-body">
                First class is free, and you do not need any experience to take it.
              </p>
              <Btn onClick={openModal}>Book a free class</Btn>
            </div>
          </div>
        </div>
      </article>

      <div className="mt-24 md:mt-32">
        <Related post={post} />
      </div>
    </>
  )
}
