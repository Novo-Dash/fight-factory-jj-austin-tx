import { useModal } from '../../hooks/useModal'
import { MaskHeading } from '../components/MaskHeading'
import { PageHead } from '../components/PageHead'
import { Reveal, Uncover } from '../components/motion'
import { Btn, Chapter, Diamond, Marquee, Pending, Rule } from '../components/ui'
import { Icon, type IconName } from '../components/Icon'
import { ADULTS, FIRST_CLASS, KIDS, STARTING_POINTS, type Program } from '../content/programs'
import { PENDING } from '../content/site'
import { TICKER } from '../content/record'

const TRACK_ICON: Record<string, IconName> = {
  gi: 'gi',
  nogi: 'nogi',
  kids: 'kids',
  womens: 'belt',
  wrestling: 'wrestling',
}

/**
 * A programme block. The two programmes mirror each other — the photograph
 * changes side — so the page has a spine without either half looking like the
 * other's template.
 */
function ProgramBlock({
  program,
  n,
  label,
  flip,
  photos,
}: {
  program: Program
  n: string
  label: string
  flip?: boolean
  photos: { src: string; alt: string }[]
}) {
  const { openModal } = useModal()

  return (
    <section id={program.slug} className="wrap scroll-mt-24 py-20 md:py-28">
      <Chapter n={n} label={label} />

      <div
        className={`mt-10 grid grid-cols-1 gap-10 lg:gap-16 ${
          flip ? 'lg:grid-cols-[1fr_0.95fr]' : 'lg:grid-cols-[0.95fr_1fr]'
        }`}
      >
        <div className={flip ? 'lg:order-2' : ''}>
          <MaskHeading text={program.title} className="t-display" />
          <Reveal delay={90}>
            <p className="label mt-7 flex items-center gap-2.5 text-red">
              <Diamond />
              {program.eyebrow}
            </p>
            <p className="t-lead mt-5 max-w-xl text-body">{program.copy}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn onClick={openModal}>Book a free trial</Btn>
              <Btn href="/schedule" variant="ghost" icon="calendar">
                Times
              </Btn>
            </div>
          </Reveal>
        </div>

        <div className={`photo-row grid grid-cols-1 gap-4 ${flip ? 'lg:order-1' : ''}`}>
          {photos.map((p, i) => (
            <Uncover
              key={p.src}
              delay={i * 90}
              className={i === 0 ? 'h-[58vw] max-h-[420px] lg:h-[26rem]' : 'h-[34vw] max-h-[240px] lg:h-[13rem]'}
            >
              <img src={p.src} alt={p.alt} loading="lazy" />
            </Uncover>
          ))}
        </div>
      </div>

      {/* The class types, as a record. This is the part a prospective student
          actually reads, so it gets the tabular treatment rather than cards. */}
      <Rule className="mt-16" />
      <ul>
        {program.classes.map((c, i) => (
          <Reveal as="li" key={c.name} delay={i * 40}>
            <div className="record-row grid-cols-1 md:grid-cols-[auto_1.15fr_0.85fr_auto] md:items-baseline">
              <span className="flex items-center gap-3 text-ink md:pr-2">
                <Icon name={TRACK_ICON[c.track]} size={22} />
              </span>
              <div>
                <h3 className="display-line t-body">{c.name}</h3>
                <p className="t-body mt-1.5 text-body">{c.note}</p>
              </div>
              <p className="label-sm text-muted md:pt-1">{c.days}</p>
              <p className="label nums text-ink md:text-right">{c.times}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}

/* ── Which class first ────────────────────────────────────────────────────
   The single most useful thing an institutional page can do for a beginner:
   name the class they should walk into. */

function StartHere() {
  return (
    <section className="bg-ink text-white">
      <div className="wrap py-20 md:py-28">
        <Chapter n="03" label="Start here" invert />
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16">
          <MaskHeading text={'Which class\nis yours'} className="t-display text-white" />
          <Reveal>
            <p className="standfirst max-w-md text-white/60">
              Every one of these is a real class on the timetable this week. Find the row that
              describes you and book that one.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14">
          {STARTING_POINTS.map((s, i) => (
            <Reveal as="li" key={s.who} delay={i * 50}>
              <div className="record-row record-row-invert grid-cols-1 md:grid-cols-[0.9fr_0.85fr_1fr_auto] md:items-baseline">
                <div className="flex items-baseline gap-4">
                  <span className="label-sm nums w-6 shrink-0 text-white/30">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="display-line t-body text-white">
                    {s.who}
                  </h3>
                </div>
                <p className="label text-red">{s.pick}</p>
                <p className="t-body text-white/55">{s.why}</p>
                <p className="label-sm nums shrink-0 text-white/70 md:text-right">{s.when}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <div className="mt-12">
            <Btn href="/schedule" variant="ghost-invert" icon="calendar">
              The full timetable
            </Btn>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── The first visit ─────────────────────────────────────────────────────── */

function FirstVisit() {
  const { openModal } = useModal()

  return (
    <section className="wrap py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <Chapter n="04" label="Your first class" />
        <Reveal>
          <Pending>{PENDING.pricing}</Pending>
        </Reveal>
      </div>

      <MaskHeading text={'Three steps, and\nnone of them cost\nanything'} className="t-display mt-9 max-w-4xl" />

      <ol className="mt-14 grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-3">
        {FIRST_CLASS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 80}>
            <div className="record-row grid-cols-1">
              <span className="chapter-num block leading-none">{s.n}</span>
              <h3 className="t-sub mt-5">{s.title}</h3>
              <p className="t-body mt-3 text-body">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        <div className="mt-14 flex flex-wrap gap-3">
          <Btn onClick={openModal}>Book your free class</Btn>
          <Btn href="/contact" variant="ghost" icon="mail">
            Ask a question
          </Btn>
        </div>
      </Reveal>
    </section>
  )
}

export function ProgramsPage() {
  return (
    <>
      <PageHead
        tag="Programmes"
        title={'Two programmes.\nTen kinds\nof class.'}
        standfirst="Adults from thirteen up and children from four. Gi and no-gi, beginners-only rooms, wrestling, and a women's class, all under the same coaching staff."
      />

      <ProgramBlock
        program={ADULTS}
        n="01"
        label="Adults · 13 and up"
        photos={[
          { src: '/site/programs/adults-gi.webp', alt: 'Adults gi class training on the main mat' },
          { src: '/site/programs/adults-nogi.webp', alt: 'A no-gi round in rash guards and shorts' },
        ]}
      />

      <div className="border-y border-rule bg-shell-2 py-4">
        <Marquee items={TICKER} duration={58} reverse />
      </div>

      <ProgramBlock
        program={KIDS}
        n="02"
        label="Kids · 4 to 12"
        flip
        photos={[
          { src: '/site/programs/kids-a.webp', alt: 'Children drilling in pairs during a kids class' },
          { src: '/site/programs/kids-d.webp', alt: 'Two children shaking hands before a round' },
        ]}
      />

      <StartHere />
      <FirstVisit />
    </>
  )
}
