import { useModal } from '../../hooks/useModal'
import { MaskHeading } from '../components/MaskHeading'
import { Reveal } from '../components/motion'
import { useParallax } from '../components/scroll'
import { Btn, Carousel, Chapter, Counter, Diamond, Marquee, Rule, Stars, Tag } from '../components/ui'
import { DragRail } from '../components/DragRail'
import { ExpandRail, type Panel } from '../components/ExpandRail'
import { GoogleRating } from '../components/GoogleRating'
import { Icon } from '../components/Icon'
import {
  ACADEMY,
  GALLERY_COPY,
  PROOF,
  TRIAL_COPY,
  TRIAL_HEADLINE,
  WELCOME_COPY,
} from '../content/site'
import { ATHLETES, MILESTONES, SHOW_ATHLETE_RECORD, TICKER } from '../content/record'
import { ADULTS, KIDS } from '../content/programs'
import { REVIEWS, REVIEWS_COPY } from '../content/testimonials'
/* Straight from ./types, never from the blog's index: importing anything
   through that index evaluates its `import.meta.glob`, which pulls every post
   body into this page's bundle. Measured: 29 KB of posts arriving on the home
   page to render three cards. */
import { CATEGORIES } from '../content/blog/types'
import { LATEST } from '../content/blog/latest.generated'
import { formatDateShort } from '../lib/date'

/* ── Hero ──────────────────────────────────────────────────────────────────
   A photograph carries the whole screen, with a scrim light enough that the
   room is still legible behind the type. Headline on the left, the Google
   record on the right, sharing one baseline. */

/* ── Chapter numbers ─────────────────────────────────────────────
   Derived, never typed by hand. With the athlete record off the air the
   outline still has to read 01, 02, 03… with no gap and no repeat, and
   turning SHOW_ATHLETE_RECORD back on has to renumber on its own. */

const CHAPTERS: string[] = [
  'academy',
  ...(SHOW_ATHLETE_RECORD ? ['record'] : []),
  'programs',
  'blog',
  'reviews',
  'room',
]

/** "01", "02"… in the order the chapters actually exist on the page. */
const ch = (id: string) => String(CHAPTERS.indexOf(id) + 1).padStart(2, '0')

function Hero() {
  const { openModal } = useModal()

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink">
      {/* Ground. The desktop file keeps the source's own 1.6:1 framing, which is
          what a 100svh hero measures on most laptops, so object-cover barely
          crops. The mobile file is a portrait crop placed around the subject. */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/site/home/hero-bg-sm.webp" />
        <img
          src="/site/home/hero-bg.webp"
          alt=""
          aria-hidden="true"
          width={2000}
          height={1250}
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[54%_30%] md:object-[50%_38%]"
        />
      </picture>

      {/* A light scrim: enough to read against, not enough to lose the room.
          Two layers — a vertical wash for the type and a left-side wedge for
          the headline column specifically. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(11,12,13,0.9) 0%, rgba(11,12,13,0.46) 45%, rgba(11,12,13,0.34) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden lg:block"
        style={{
          background:
            'linear-gradient(to right, rgba(11,12,13,0.6) 0%, rgba(11,12,13,0.2) 48%, rgba(11,12,13,0) 74%)',
        }}
      />

      {/* The masthead sits above this section, which is pulled up behind it, so
          the top padding has to carry the masthead height too. The column then
          centres its own content and parks the record strip on the floor. */}
      <div className="wrap flex flex-1 flex-col pb-[clamp(1.5rem,3.5vh,2.5rem)] pt-[calc(4rem+clamp(1rem,3vh,2.5rem))] md:pt-[calc(74px+clamp(1rem,3vh,3rem))]">
        <div className="flex flex-1 flex-col justify-center">
          <div className="grid grid-cols-1 items-end gap-[clamp(1.1rem,3.4vh,2.5rem)] lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-14">
            <div className="min-w-0">
              <Reveal>
                <Tag invert>
                  {ACADEMY.city}, {ACADEMY.state} &nbsp;·&nbsp; Est. {ACADEMY.founded}
                </Tag>
              </Reveal>

              <MaskHeading
                as="h1"
                text={'No ego.\nNo drama.\nJust Jiu-Jitsu.'}
                className="t-hero mt-[clamp(1rem,2.5vh,1.5rem)] text-white"
              />

              <Reveal delay={120}>
                {/* Smaller than the standfirst elsewhere, and directly under the
                    headline, so the two read as one block. */}
                <p className="mt-[clamp(0.85rem,2.2vh,1.5rem)] max-w-lg text-[0.9rem] leading-[1.55] text-white/72 md:text-[1.02rem] md:leading-[1.6]">
                  A Brazilian Jiu-Jitsu academy in north-west Austin where a first-timer and a
                  world champion warm up in the same line. Beginners are the point, not an
                  afterthought.
                </p>
                <div className="mt-[clamp(1.25rem,3vh,2rem)] flex flex-wrap gap-2.5 sm:gap-3">
                  <Btn onClick={openModal} className="!px-4 sm:!px-6">
                    Book a free trial
                  </Btn>
                  <Btn
                    href="/schedule"
                    variant="ghost-invert"
                    icon="calendar"
                    className="!px-4 sm:!px-6"
                  >
                    Schedule
                  </Btn>
                </div>
              </Reveal>
            </div>

            <Reveal delay={180} className="min-w-0 lg:justify-self-stretch">
              <GoogleRating />
            </Reveal>
          </div>
        </div>

        {/* The record strip, on the floor of the first screen. */}
        <div className="mt-[clamp(1.75rem,4vh,3.5rem)]">
          <Rule invert />
          <dl className="grid grid-cols-2 gap-x-8 gap-y-[clamp(1rem,2.5vh,1.75rem)] pt-[clamp(1.25rem,3vh,1.75rem)] md:grid-cols-4">
            {[
              { v: <Counter to={PROOF.students} suffix="+" />, l: 'Students on the mats' },
              { v: <Counter to={PROOF.yearsCoaching} suffix=" yr" />, l: 'Coaching, since 1996' },
              { v: 'UFC BJJ', l: 'Champion coached here' },
              { v: <Counter to={31} />, l: 'Classes every week' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 70}>
                <dt className="label mb-2.5 text-white/35">{String(i + 1).padStart(2, '0')}</dt>
                <dd>
                  <span className="display-line t-sub nums block text-white">{s.v}</span>
                  <span className="mt-1.5 block text-[0.9rem] leading-[1.5] text-white/60">
                    {s.l}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/* ── 01 · The academy ─────────────────────────────────────────────────────
   Client copy verbatim on the left, the academy's own timeline on the right,
   and one draggable strip of photographs underneath instead of three frames
   dropped into a grid. */

const STRIP = [
  { src: '/site/home/team-panorama.webp', alt: 'The whole academy on the mat', w: 'w-[88vw] sm:w-[62vw] lg:w-[46vw]' },
  { src: '/site/rail/ceremony.webp', alt: 'A belt ceremony in progress', w: 'w-[76vw] sm:w-[42vw] lg:w-[30vw]' },
  { src: '/site/home/drill.webp', alt: 'Two students drilling in a no-gi class', w: 'w-[76vw] sm:w-[44vw] lg:w-[32vw]' },
  { src: '/site/rail/team-hall.webp', alt: 'The team in the hall before class', w: 'w-[66vw] sm:w-[34vw] lg:w-[24vw]' },
  { src: '/site/rail/kids-pair.webp', alt: 'Two children drilling in the kids class', w: 'w-[76vw] sm:w-[42vw] lg:w-[30vw]' },
  { src: '/site/rail/corner-belt.webp', alt: 'Coaching from the corner at a competition', w: 'w-[66vw] sm:w-[32vw] lg:w-[23vw]' },
  { src: '/site/home/nogi-worlds.webp', alt: 'The team with their medals at the IBJJF No-Gi Worlds', w: 'w-[80vw] sm:w-[46vw] lg:w-[33vw]' },
]

function Academy() {
  return (
    <section className="wrap py-16 md:py-20">
      <Chapter n={ch('academy')} label="The academy" />

      <div className="mt-9 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-14">
        <div className="min-w-0">
          <MaskHeading text={'A premier\nAustin BJJ\nacademy'} className="t-display" />
          <Reveal delay={90}>
            <p className="mt-6 max-w-xl text-[0.97rem] leading-[1.68] text-body">{WELCOME_COPY}</p>
            <p className="prose-quote mt-7 text-ink">&ldquo;{ACADEMY.motto}&rdquo;</p>
            <a
              href="/about"
              className="label mt-6 inline-flex items-center gap-2.5 text-ink underline decoration-rule decoration-1 underline-offset-[6px] transition-colors hover:decoration-red"
            >
              Read the academy&rsquo;s story
              <Icon name="arrow" size={16} />
            </a>
          </Reveal>
        </div>

        {/* The timeline: a box, and the milestones inside it are themselves a
            rail you can throw. Every year on it is one the academy states. */}
        <Reveal delay={60} className="min-w-0">
          <div className="min-w-0 border border-rule bg-shell-2/70 p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <span className="label-sm flex items-center gap-2.5 text-muted">
                <Diamond className="text-red" />
                Thirty years, five marks
              </span>
              <span className="label-sm text-muted">Drag</span>
            </div>

            <div className="mt-5">
              <DragRail count={MILESTONES.length} label="Academy timeline" itemSelector=":scope > article">
                {MILESTONES.map((m) => (
                  <article
                    key={m.year}
                    className="rail-card w-[15rem] shrink-0 snap-start border border-rule bg-shell"
                  >
                    <img
                      src={m.photo}
                      alt={m.alt}
                      loading="lazy"
                      draggable={false}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-baseline gap-2.5">
                        <span className="display-line nums text-[1.35rem] text-red">{m.year}</span>
                        <span className="h-px flex-1 bg-rule" />
                      </div>
                      <h3 className="display-line mt-3 text-[1rem]">{m.title}</h3>
                      <p className="mt-2.5 text-[0.83rem] leading-[1.55] text-body">{m.text}</p>
                    </div>
                  </article>
                ))}
              </DragRail>
            </div>
          </div>
        </Reveal>
      </div>

      {/* One strip, full-bleed to the right, thrown by hand. */}
      <div className="mt-12">
        <DragRail
          count={STRIP.length}
          label="Inside the academy"
          className="-mr-[clamp(1.15rem,4vw,3.25rem)] lg:-mr-[max(0px,calc((100vw-86rem)/2+3.25rem))]"
          itemSelector=":scope > figure"
        >
          {STRIP.map((p) => (
            <figure key={p.src} className={`rail-card h-[42vw] max-h-[340px] shrink-0 snap-start ${p.w}`}>
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </figure>
          ))}
        </DragRail>
      </div>
    </section>
  )
}

/* ── 02 · The record ──────────────────────────────────────────────────────
   The differentiator, and the only section on an ink ground. Four athletes,
   each with a face, kept to one screen. */

function Record() {
  const photo = useParallax(44)
  const portraits: Record<string, string> = {
    'Andrew Tackett': '/site/team/andrew-tackett.webp',
    'William Tackett': '/site/team/william-tackett.webp',
    'Kody Steele': '/site/team/kody-steele.webp',
    'Tiffany Butler': '/site/team/tiffany-butler.webp',
  }

  return (
    <section className="relative bg-ink text-white">
      <div className="wrap py-16 md:py-20">
        <Chapter n={ch('record')} label="The record" invert />

        <div className="mt-9 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end lg:gap-14">
          <MaskHeading text={'Built on\nthese mats'} className="t-display text-white" />
          <Reveal>
            <p className="mt-1 max-w-md text-[0.97rem] leading-[1.65] text-white/60">
              Fight Factory is best known for who came out of it. A UFC BJJ champion, a world
              champion, an undefeated MMA prospect, all coached here, from coloured belt to
              title.
            </p>
          </Reveal>
        </div>

        <ul className="mt-11 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ATHLETES.map((a, i) => (
            <Reveal as="li" key={a.name} delay={i * 70}>
              <article className="group relative h-full overflow-hidden border border-white/12 bg-ink-2">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={portraits[a.name]}
                    alt={`${a.name}, ${a.title}`}
                    width={760}
                    height={1064}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-top grayscale transition-[filter,transform] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(11,12,13,0.96) 0%, rgba(11,12,13,0.25) 55%, rgba(11,12,13,0) 100%)',
                    }}
                  />
                  <span className="label-sm nums absolute left-4 top-4 text-white/45">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-4">
                    <span className="display-line block text-[1.12rem] text-white">{a.name}</span>
                    <span className="label-sm mt-2.5 block text-red">{a.title}</span>
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <p className="text-[0.83rem] leading-[1.5] text-white/55">{a.detail}</p>
                  <span className="label-sm nums shrink-0 whitespace-nowrap text-white/75">
                    {a.mark}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>

      {/* Full-bleed, shallower than before, with clamped parallax. */}
      <div className="relative h-[38vw] max-h-[420px] min-h-[240px] overflow-hidden">
        <img
          ref={photo}
          src="/site/home/ufc-bjj.webp"
          alt="Andrew Tackett with the UFC BJJ championship belt beside Rodrigo Cabral and William Tackett"
          width={1536}
          height={1085}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-[50%_14%] will-change-transform"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(11,12,13,0.92) 0%, rgba(11,12,13,0.15) 60%, rgba(11,12,13,0.3) 100%)',
          }}
        />
        <figcaption className="wrap absolute inset-x-0 bottom-0 pb-7">
          <p className="label-sm flex items-center gap-2.5 text-white/70">
            <Diamond className="text-red" />
            Andrew Tackett, UFC BJJ Champion &nbsp;·&nbsp; with Rodrigo Cabral and William Tackett
          </p>
        </figcaption>
      </div>
    </section>
  )
}

/* ── 03 · Programmes ──────────────────────────────────────────────────────
   Compressed panels that open. Same information as a bento, a third of the
   height, and the pointer does the explaining. */

const PANELS: Panel[] = [
  {
    id: 'adults',
    href: '/programs#adults',
    eyebrow: ADULTS.eyebrow,
    title: 'Adults\nJiu-Jitsu',
    meta: `${ADULTS.classes.length} class types · Mon – Sat`,
    photo: ADULTS.photo,
    alt: 'Adults gi class training on the main mat',
    icon: 'gi',
    points: ['Gi and no-gi, every level', 'Beginners paired deliberately', 'Mornings, midday and evenings'],
  },
  {
    id: 'kids',
    href: '/programs#kids',
    eyebrow: KIDS.eyebrow,
    title: 'Kids\nJiu-Jitsu',
    meta: 'Ages 4–6 · 7–12 · Mon · Wed · Thu',
    photo: '/site/programs/kids-c.webp',
    alt: 'A coach guiding a young student through a technique',
    icon: 'kids',
    points: ['Forty-five minute classes', 'Confidence, focus and discipline', 'Coached by a world champion'],
  },
  {
    id: 'womens',
    href: '/programs#adults',
    eyebrow: 'Women only',
    title: "Women's\nClass",
    meta: 'Tue · Thu 12:30 PM · Sat 9:30 AM',
    photo: '/site/programs/womens.webp',
    alt: 'Two of the academy’s brown belts with coach Rodrigo Cabral',
    icon: 'belt',
    points: ['All levels welcome', 'Coached by a No-Gi World Champion', 'Three sessions a week'],
  },
  {
    id: 'white-belts',
    href: '/programs#adults',
    eyebrow: 'First month',
    title: 'White\nBelts Only',
    meta: 'Friday 5:00 PM',
    photo: '/site/programs/adults-roll.webp',
    alt: 'Adults rolling in the gi on the main mat',
    icon: 'nogi',
    points: ['A room of first-timers', 'Nobody outranks anybody', 'The place to start from zero'],
  },
  {
    id: 'wrestling',
    href: '/programs#adults',
    eyebrow: 'Takedowns',
    title: 'Wrestling',
    meta: 'Monday 11:00 AM',
    photo: '/site/programs/adults-nogi.webp',
    alt: 'A no-gi round finishing on top during an adults class',
    icon: 'wrestling',
    points: ['Taught by wrestlers', 'Top pressure and entries', 'Feeds straight into no-gi'],
  },
]

function Programs() {
  return (
    <section className="wrap py-16 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <Chapter n={ch('programs')} label="Programmes" />
        <Reveal>
          <a
            href="/programs"
            className="label inline-flex items-center gap-2.5 text-ink underline decoration-rule decoration-1 underline-offset-[6px] transition-colors hover:decoration-red"
          >
            All programmes
            <Icon name="arrow" size={16} />
          </a>
        </Reveal>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end lg:gap-14">
        <MaskHeading text={'Pick the room\nyou belong in'} className="t-display" />
        <Reveal>
          <p className="mb-1 text-[0.95rem] leading-[1.6] text-body">
            Five rooms, one coaching staff. Hover a panel to see what is inside it.
          </p>
        </Reveal>
      </div>

      <div className="mt-10">
        <ExpandRail panels={PANELS} />
      </div>
    </section>
  )
}

/* ── Latest from the blog ──────────────────────────────────────
   Four posts, and it sits in ink on purpose.

   Two jobs at once. It shows the academy is alive, which a competition result
   proves better than any claim on a page. And it puts the dark ground back in
   this stretch of the home page: the athlete record that used to hold it is
   off the air until the new portraits arrive, which had left four pale
   sections in a row between the hero and the red band.

   The newest post gets the picture. The three behind it are record rows, the
   device the rest of the site uses for a list that has to stay scannable, so
   this is not a third grid of equal cards. */

function Latest() {
  /* Metadata only, from the generated module. Reading the real post list here
     would bundle every post body into the page most visitors land on. */
  const [lead, ...rest] = LATEST.slice(0, 4)
  if (!lead) return null

  return (
    <section className="bg-ink text-white">
      <div className="wrap py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Chapter n={ch('blog')} label="Latest" invert />
          <Reveal>
            <a
              href="/blog"
              className="label inline-flex items-center gap-2.5 text-white underline decoration-white/30 decoration-1 underline-offset-[6px] transition-colors hover:decoration-red"
            >
              All posts
              <Icon name="arrow" size={16} />
            </a>
          </Reveal>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end lg:gap-14">
          <MaskHeading text={'Lately on\nthe mat'} className="t-display text-white" />
          <Reveal>
            <p className="mb-1 text-[0.95rem] leading-[1.6] text-white/60">
              Competition results and what is going on in the academy, updated as it happens.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <Reveal>
            <a href={`/blog/${lead.slug}`} className="group block">
              <div className="overflow-hidden bg-ink-2">
                <img
                  src={lead.cover.src}
                  alt={lead.cover.alt}
                  width={lead.cover.w}
                  height={lead.cover.h}
                  loading="lazy"
                  style={{ objectPosition: lead.cover.focus ?? '50% 35%' }}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </div>
              <span className="label-sm nums mt-5 flex items-center gap-2.5 text-white/50">
                <span className="text-red">{CATEGORIES[lead.category]}</span>
                <Diamond className="text-white/25" />
                <time dateTime={lead.date}>{formatDateShort(lead.date)}</time>
              </span>
              <h3 className="display-line mt-3.5 text-[1.24rem] text-white transition-colors duration-200 group-hover:text-red md:text-[1.4rem]">
                {lead.title}
              </h3>
              <p className="mt-3 max-w-lg text-[0.95rem] leading-[1.6] text-white/60">
                {lead.excerpt}
              </p>
            </a>
          </Reveal>

          <ul className="flex flex-col justify-between gap-2">
            {rest.map((post, i) => (
              <Reveal as="li" key={post.slug} delay={i * 70} className="flex-1">
                <a
                  href={`/blog/${post.slug}`}
                  className="record-row record-row-invert group flex h-full items-center"
                >
                  <div className="flex w-full items-center gap-5">
                    <div className="w-[104px] shrink-0 overflow-hidden bg-ink-2 sm:w-[128px]">
                      <img
                        src={post.cover.src}
                        alt={post.cover.alt}
                        width={post.cover.w}
                        height={post.cover.h}
                        loading="lazy"
                        style={{ objectPosition: post.cover.focus ?? '50% 35%' }}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="label-sm nums flex flex-wrap items-center gap-2.5 text-white/45">
                        <span className="text-red">{CATEGORIES[post.category]}</span>
                        <Diamond className="text-white/25" />
                        <time dateTime={post.date}>{formatDateShort(post.date)}</time>
                      </span>
                      <h3 className="display-line mt-2.5 text-[1.02rem] text-white transition-colors duration-200 group-hover:text-red">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ── 04 · Reviews ─────────────────────────────────────────────────────────
   The academy's own published Google reviews, in full, on a shallower card so
   the section costs one screen instead of two. */

function Reviews() {
  return (
    <section className="bg-shell-2">
      <div className="wrap py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <Chapter n={ch('reviews')} label="What members say" />
          <Reveal>
            <div className="flex items-center gap-4">
              <span className="display-line text-[2.2rem] leading-none">{PROOF.googleRating}</span>
              <span className="block">
                <Stars />
                <span className="label-sm mt-2 block text-muted">
                  {PROOF.googleReviews}+ Google reviews
                </span>
              </span>
            </div>
          </Reveal>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end lg:gap-14">
          <MaskHeading text={'Five point zero,\nninety-six times'} className="t-display" />
          <Reveal>
            <p className="mb-1 text-[0.95rem] leading-[1.62] text-body">{REVIEWS_COPY}</p>
          </Reveal>
        </div>

        <div className="mt-10">
          <Carousel count={REVIEWS.length} label="Member reviews" fade>
            {REVIEWS.map((r) => (
              <figure
                key={r.id}
                className="flex min-w-[84%] snap-start flex-col justify-between border border-rule bg-shell p-6 sm:min-w-[58%] md:p-7 lg:min-w-[44%]"
              >
                <div>
                  <Stars className="mb-4 text-red" />
                  <blockquote className="text-[0.9rem] leading-[1.62] text-body">{r.text}</blockquote>
                </div>
                <figcaption className="mt-6">
                  <Rule />
                  <span className="label mt-4 block text-ink">{r.name}</span>
                  <span className="label-sm mt-2 block text-muted">Google review</span>
                </figcaption>
              </figure>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}

/* ── 05 · Inside the Fight Factory ────────────────────────────────────────
   A gallery that runs from the left of the measure clear off the right edge.
   Frames alternate height so the rail has a rhythm rather than a row of equal
   thumbnails, each one is numbered and captioned, and the whole thing can be
   thrown by hand. */

const GALLERY = [
  { src: '/site/facility/mat-a.webp', cap: 'The competition mat', tall: true },
  { src: '/site/team/staff-line.webp', cap: 'After training', tall: false },
  { src: '/site/rail/ceremony.webp', cap: 'Belt ceremony', tall: true },
  { src: '/site/facility/pro-shop.webp', cap: 'The pro shop', tall: false },
  { src: '/site/rail/backlit.webp', cap: 'Before the round', tall: true },
  { src: '/site/facility/kids-line.webp', cap: 'The kids class', tall: false },
  { src: '/site/home/nogi-worlds.webp', cap: 'IBJJF No-Gi Worlds', tall: true },
  { src: '/site/rail/mat-corner.webp', cap: 'The far corner', tall: false },
  { src: '/site/rail/mat-wide.webp', cap: 'Room to roll', tall: true },
]

function Room() {
  return (
    <section className="py-16 md:py-20">
      <div className="wrap">
        <Chapter n={ch('room')} label="Inside the Fight Factory" />
        <div className="mt-9 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end lg:gap-14">
          <MaskHeading text={'Where champions\nare made'} className="t-display" />
          <Reveal>
            <p className="mb-1 text-[0.95rem] leading-[1.62] text-body">{GALLERY_COPY}</p>
          </Reveal>
        </div>

        <div className="mt-11">
          <DragRail
            count={GALLERY.length}
            label="Gallery"
            align="start"
            className="-mr-[clamp(1.15rem,4vw,3.25rem)] lg:-mr-[max(0px,calc((100vw-86rem)/2+3.25rem))]"
            itemSelector=":scope > figure"
          >
            {GALLERY.map((g, i) => (
              <figure
                key={g.src}
                className={`rail-card group shrink-0 snap-start ${
                  g.tall ? 'w-[68vw] sm:w-[34vw] lg:w-[25vw]' : 'w-[58vw] sm:w-[27vw] lg:w-[19vw]'
                }`}
              >
                <div
                  className={`relative overflow-hidden bg-shell-2 ${
                    g.tall ? 'h-[62vw] max-h-[400px]' : 'h-[46vw] max-h-[290px]'
                  }`}
                >
                  <img
                    src={g.src}
                    alt={g.cap}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                </div>
                <figcaption className="rule-ticks mt-3 flex items-baseline justify-between gap-3 pt-3">
                  <span className="label-sm text-body">{g.cap}</span>
                  <span className="label-sm nums text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </figcaption>
              </figure>
            ))}
          </DragRail>
        </div>
      </div>
    </section>
  )
}

/* ── The one loud moment ──────────────────────────────────────────────────
   The single full-bleed use of the accent, kept for the last thing the reader
   sees, and built like a poster: an oversized figure, the three things a first
   class actually promises, and a ticker so the band is alive. */

function TrialBand() {
  const { openModal } = useModal()

  return (
    <section className="relative isolate overflow-hidden bg-red text-white">
      {/* The mark, blown up and cropped, as a watermark. */}
      <img
        src="/site/brand/wordmark-light.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-10 -z-10 hidden w-[46rem] max-w-none opacity-[0.07] lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '92px 92px',
          maskImage: 'radial-gradient(75% 90% at 15% 0%, #000 0%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(75% 90% at 15% 0%, #000 0%, transparent 78%)',
        }}
      />

      <div className="wrap py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div className="min-w-0">
            <Reveal>
              <span className="label-sm flex items-center gap-2.5 text-white/75">
                <Diamond className="text-white" />
                Try a class for free
              </span>
            </Reveal>

            {/* The figure that matters, at poster size. */}
            <Reveal delay={60}>
              <div className="mt-7 flex items-start gap-5">
                <span
                  className="display-line leading-[0.8] text-white"
                  style={{ fontSize: 'clamp(5rem,12vw,9.5rem)' }}
                >
                  $0
                </span>
                <span className="mt-3 max-w-[11rem] text-[0.9rem] leading-[1.45] text-white/80">
                  Your first class, the uniform, and the mat time. No card, no commitment.
                </span>
              </div>
            </Reveal>

            {/* TRIAL_HEADLINE verbatim, with the line breaks the measure wants.
                No second copy of the string anywhere: a duplicate would put the
                headline in the DOM twice for a crawler and a screen reader. */}
            <MaskHeading
              text={TRIAL_HEADLINE.replace('Jiu-Jitsu. No', 'Jiu-Jitsu.\nNo')}
              className="t-title mt-8 max-w-2xl"
            />
          </div>

          <div className="min-w-0 lg:pl-6">
            <Reveal delay={90}>
              <p className="text-[1rem] leading-[1.62] text-white/85">{TRIAL_COPY}</p>
            </Reveal>

            <Reveal delay={130}>
              <ul className="mt-8">
                {[
                  { icon: 'calendar' as const, t: 'Pick a real time', d: 'The calendar shows live availability, class by class.' },
                  { icon: 'gi' as const, t: 'Uniform provided', d: 'Turn up in comfortable clothes; the gi is on us.' },
                  { icon: 'belt' as const, t: 'Nobody spars you', d: 'Rolling is optional on a first class. Always.' },
                ].map((r) => (
                  <li
                    key={r.t}
                    className="flex items-start gap-4 border-t border-white/25 py-4 [--icon-accent:#fff]"
                  >
                    <Icon name={r.icon} size={22} className="mt-0.5 shrink-0 text-white" />
                    <span>
                      <span className="display-line block text-[1rem] text-white">{r.t}</span>
                      <span className="mt-1.5 block text-[0.85rem] leading-[1.5] text-white/75">
                        {r.d}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={170}>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={openModal} className="btn btn-ink">
                  <span className="btn-roll">
                    <span>Book your free class</span>
                    <span aria-hidden="true">Book your free class</span>
                  </span>
                  <Icon name="arrow" size={17} />
                </button>
                <a href={ACADEMY.phoneHref} className="btn btn-ghost-invert">
                  <Icon name="phone" size={16} />
                  <span className="nums">{ACADEMY.phone}</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="border-t border-white/25 py-3.5">
        <Marquee items={TICKER} invert duration={64} reverse />
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Hero />
      <div className="border-b border-rule bg-ink py-4">
        <Marquee items={TICKER} invert duration={52} />
      </div>
      <Academy />
      {SHOW_ATHLETE_RECORD ? <Record /> : null}
      <Programs />
      <Latest />
      <Reviews />
      <Room />
      <TrialBand />
    </>
  )
}
