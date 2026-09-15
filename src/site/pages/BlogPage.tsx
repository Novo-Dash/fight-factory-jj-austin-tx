import { useLayoutEffect, useRef, useState } from 'react'
import { PageHead } from '../components/PageHead'
import { MaskHeading } from '../components/MaskHeading'
import { Reveal, Uncover } from '../components/motion'
import { Diamond, Rule } from '../components/ui'
import { Icon } from '../components/Icon'
import { CATEGORIES, allPosts, usedCategories, type Category, type Post } from '../content/blog'
import { formatDate } from '../lib/date'
import { coverStyle } from '../lib/cover'
import { clampWords } from '../lib/text'

/* ── The index ────────────────────────────────────────────────────────────
   A blog index is a list, so it is built as one rather than as a wall of
   identical cards. The newest post is given the width it deserves, and
   everything under it runs in two columns where each picture keeps its own
   proportions. That irregularity is the point: uniform 16:9 crops across a
   page of collages and phone photos is what makes an index look templated. */

const POSTS = allPosts()
const FILTERS: (Category | 'all')[] = ['all', ...usedCategories()]

function Meta({ post, invert = false }: { post: Post; invert?: boolean }) {
  return (
    <span
      className={`label-sm nums flex flex-wrap items-center gap-2.5 ${
        invert ? 'text-white/55' : 'text-muted'
      }`}
    >
      <span className={invert ? 'text-white/80' : 'text-red'}>{CATEGORIES[post.category]}</span>
      <Diamond className={invert ? 'text-white/30' : 'text-rule'} />
      <time dateTime={post.date}>{formatDate(post.date)}</time>
    </span>
  )
}

/* The newest post. Full width, picture on the left, the reading on the right. */
function Lead({ post }: { post: Post }) {
  return (
    <section className="wrap pt-12 md:pt-16">
      <a
        href={`/blog/${post.slug}`}
        className="group grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-14"
      >
        <Uncover>
          <div className="relative overflow-hidden bg-shell-2">
            <img
              src={post.cover.src}
              alt={post.cover.alt}
              width={post.cover.w}
              height={post.cover.h}
              loading="eager"
              fetchPriority="high"
              /* A fixed wide crop, so the top of the page is the same shape
                 whatever the newest post happens to be. `focus` is what keeps
                 a portrait from being cropped through the face. */
              style={{ objectPosition: post.cover.focus ?? '50% 35%' }}
              className="aspect-[16/10] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.028]"
            />
          </div>
        </Uncover>

        <div>
          <Reveal>
            <Meta post={post} />
          </Reveal>
          <MaskHeading
            as="h2"
            text={post.title}
            className="t-display mt-5 transition-colors duration-200 group-hover:text-red"
          />
          <Reveal delay={90}>
            <p className="t-body mt-5 max-w-lg text-body">{post.excerpt}</p>
          </Reveal>
          <Reveal delay={140}>
            <span className="label mt-7 inline-flex items-center gap-2.5 text-ink">
              Read it
              <Icon name="arrow" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Reveal>
        </div>
      </a>
    </section>
  )
}

function Card({ post }: { post: Post }) {
  return (
    <a href={`/blog/${post.slug}`} className="rv group block">
      <div className="relative overflow-hidden bg-shell-2">
        <img
          src={post.cover.src}
          alt={post.cover.alt}
          width={post.cover.w}
          height={post.cover.h}
          loading="lazy"
          /* Its own shape, within bounds. See lib/cover.ts. */
          style={coverStyle(post.cover)}
          className="w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.035]"
        />
      </div>
      <div className="mt-5">
        <Meta post={post} />
        <h3 className="display-line mt-3.5 text-[1.12rem] text-ink transition-colors duration-200 group-hover:text-red md:text-[1.24rem]">
          {post.title}
        </h3>
        <p className="t-body mt-3 text-body">{clampWords(post.excerpt, 132)}</p>
      </div>
    </a>
  )
}

export function BlogPage() {
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const gridRef = useRef<HTMLDivElement>(null)

  const [lead, ...rest] = POSTS
  const shown = filter === 'all' ? rest : POSTS.filter((post) => post.category === filter)

  /* The page-wide scroll observer collects `.rv` nodes once, on mount. Cards
     rendered later by this filter are never in that set, so without this they
     would keep the start state CSS gives them and stay invisible for good.
     Filtering is a click, not a scroll: the result should be there at once. */
  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const frame = requestAnimationFrame(() => {
      grid.querySelectorAll<HTMLElement>('.rv').forEach((el) => el.classList.add('is-in'))
    })
    return () => cancelAnimationFrame(frame)
  }, [filter])

  return (
    <>
      <PageHead
        tag="Blog"
        title={'What happens\nhere'}
        standfirst="Competition results, academy news and the answers we give most often to people about to start."
      />

      <Lead post={lead} />

      <section className="wrap pb-24 pt-16 md:pb-32 md:pt-20">
        <Rule />

        {/* A filter, not a nav: plain labels on one line, the live one marked
            in the accent the whole site uses. */}
        <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3">
          {FILTERS.map((key) => {
            const live = key === filter
            const count = key === 'all' ? POSTS.length : POSTS.filter((p) => p.category === key).length
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={live}
                className={`label nums cursor-pointer border-b pb-2 transition-colors duration-200 ${
                  live ? 'border-red text-red' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {key === 'all' ? 'Everything' : CATEGORIES[key]}
                <span className={`ml-2 ${live ? 'text-red/60' : 'text-rule'}`}>{count}</span>
              </button>
            )
          })}
        </div>

        <div
          ref={gridRef}
          key={filter}
          className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 md:gap-x-10 md:gap-y-16"
        >
          {shown.map((post) => (
            <Card key={post.slug} post={post} />
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="t-body mt-12 text-muted">Nothing filed under this yet.</p>
        ) : null}
      </section>
    </>
  )
}
