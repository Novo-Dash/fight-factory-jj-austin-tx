import { useState } from 'react'
import { useModal } from '../../hooks/useModal'
import { MaskHeading } from '../components/MaskHeading'
import { PageHead } from '../components/PageHead'
import { Reveal, Uncover } from '../components/motion'
import { useParallax } from '../components/scroll'
import { Btn, Chapter, Counter, Diamond, Pending, Rule } from '../components/ui'
import { Icon } from '../components/Icon'
import {
  ABOUT_OPENER,
  ACADEMY,
  AFFILIATES,
  APPROACH_COPY,
  PENDING,
  PROOF,
  VALUES,
} from '../content/site'
import { COACHES, HEAD_COACH, TEAM_COPY } from '../content/staff'
import { RESULTS } from '../content/record'

/* ── The belt line ────────────────────────────────────────────────────────
   Rodrigo's promotions, taken from his own biography. A horizontal record
   rather than a vertical timeline of identical cards. */

const BELTS = [
  { year: '1996', belt: 'Blue', under: 'Ricardo Holanda “Ricardão”' },
  { year: '1998', belt: 'Purple', under: 'Fredson Alves · Gracie Humaitá' },
  { year: '2002', belt: 'Brown', under: 'Rocian Gracie · São Paulo' },
  { year: '2005', belt: 'Black', under: 'Léo Vieira' },
]

function Founder() {
  return (
    <section className="wrap py-20 md:py-28">
      <Chapter n="02" label="Head instructor & founder" />

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        <div>
          <Uncover>
            <img
              src={HEAD_COACH.photo ?? ''}
              alt="Rodrigo “Brucutu” Cabral, head instructor and founder"
              width={760}
              height={1064}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover object-top"
            />
          </Uncover>
          <Reveal delay={70}>
            <div className="record-row grid-cols-[auto_1fr] !border-t-0">
              <span className="label text-red">{HEAD_COACH.role}</span>
            </div>
            <ul className="space-y-2.5">
              {HEAD_COACH.record.map((r) => (
                <li key={r} className="t-body flex gap-3 text-body">
                  <Diamond className="mt-2 text-red" />
                  {r}
                </li>
              ))}
            </ul>
            <a
              href={ACADEMY.coachInstagram}
              target="_blank"
              rel="noreferrer noopener"
              className="label mt-7 inline-flex items-center gap-2.5 text-ink underline decoration-rule decoration-1 underline-offset-[6px] transition-colors hover:decoration-red"
            >
              @brucutubjj
              <Icon name="arrow" size={16} />
            </a>
          </Reveal>
        </div>

        <div>
          <MaskHeading text={'Rodrigo\n“Brucutu”\nCabral'} className="t-display" />
          <div className="copy t-body mt-9 max-w-2xl">
            {HEAD_COACH.bio.map((p, i) => (
              <Reveal as="p" key={i} delay={i * 40}>
                {p}
              </Reveal>
            ))}
          </div>

          {/* The belt line */}
          <Rule className="mt-12" />
          <ol className="grid grid-cols-2 gap-x-8 gap-y-7 pt-8 md:grid-cols-4">
            {BELTS.map((b, i) => (
              <Reveal as="li" key={b.year} delay={i * 70}>
                <span className="label nums block text-muted">{b.year}</span>
                <span className="display-line t-sub mt-2.5 block">{b.belt}</span>
                <span className="t-body mt-1.5 block text-body">{b.under}</span>
                <span
                  aria-hidden="true"
                  className="mt-4 block h-[3px] w-12"
                  style={{
                    background: ['#4A86C8', '#7B4FA8', '#6B4A2F', '#0B0C0D'][i],
                  }}
                />
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ── Values ───────────────────────────────────────────────────────────────
   The academy's five values, verbatim, as a numbered record on rules. Not
   five identical cards with an icon in a circle. */

function Values() {
  return (
    <section className="bg-ink text-white">
      <div className="wrap py-20 md:py-28">
        <Chapter n="03" label="Why it’s important" invert />
        <MaskHeading text={'What the mat\ngives back'} className="t-display mt-9 text-white" />

        <ol className="mt-14 grid grid-cols-1 gap-x-16 lg:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal as="li" key={v.name} delay={i * 55}>
              <div className="record-row record-row-invert grid-cols-[auto_1fr] items-start">
                <span className="label-sm nums pt-1.5 text-white/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="t-sub text-white">{v.name}</h3>
                  <p className="t-body mt-2.5 max-w-lg text-white/58">{v.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ── Coaching staff ───────────────────────────────────────────────────────
   Record rows that open. The portrait is the reward for opening one, so the
   page is not six identical head-shot cards on load. */

function Staff() {
  const [open, setOpen] = useState<string | null>(COACHES[0].slug)

  return (
    <section className="wrap py-20 md:py-28">
      <Chapter n="04" label="Our trainers" />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-16">
        <MaskHeading text={'Coached by\npeople who\nstill compete'} className="t-display" />
        <div className="copy t-body max-w-md text-body">
          {TEAM_COPY.map((p, i) => (
            <Reveal as="p" key={i} delay={i * 60}>
              {p}
            </Reveal>
          ))}
        </div>
      </div>

      <ul className="mt-14">
        {COACHES.map((c, i) => {
          const isOpen = open === c.slug
          return (
            <Reveal as="li" key={c.slug} delay={i * 45}>
              <div className="record-row grid-cols-1">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : c.slug)}
                  aria-expanded={isOpen}
                  className="group flex w-full cursor-pointer items-baseline gap-4 text-left md:gap-8"
                >
                  <span className="label-sm nums w-6 shrink-0 text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display-line t-sub block transition-colors duration-200 group-hover:text-red">
                      {c.name}
                    </span>
                    <span className="label-sm mt-2.5 block text-muted">{c.role}</span>
                  </span>
                  <span className="label hidden max-w-[46%] shrink-0 text-right text-body md:block">
                    {c.credential}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center border border-rule transition-transform duration-300 ${
                      isOpen ? 'rotate-45 border-red text-red' : 'text-ink'
                    }`}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>

                {isOpen ? (
                  <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] md:gap-12">
                    <div>
                      {c.photo ? (
                        <img
                          src={c.photo}
                          alt={`${c.name}, ${c.role}`}
                          width={760}
                          height={1064}
                          loading="lazy"
                          className="aspect-[3/4] w-full max-w-[280px] object-cover object-top"
                        />
                      ) : (
                        <div className="flex aspect-[3/4] w-full max-w-[280px] items-center justify-center border border-dashed border-rule bg-shell-2">
                          <Pending>{PENDING.calebPortrait}</Pending>
                        </div>
                      )}
                    </div>
                    <div>
                      <ul className="mb-7 space-y-2">
                        {c.record.map((r) => (
                          <li key={r} className="t-body flex gap-3 text-ink">
                            <Diamond className="mt-2 text-red" />
                            {r}
                          </li>
                        ))}
                      </ul>
                      {c.bio.length ? (
                        <div className="copy t-body max-w-2xl">
                          {c.bio.map((p, k) => (
                            <p key={k}>{p}</p>
                          ))}
                        </div>
                      ) : (
                        <Pending>Biography pending, supplied by the academy</Pending>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}

/* ── Recent results ───────────────────────────────────────────────────────
   The record is not historical: these are the academy's own posts from this
   competition season. */

function Results() {
  return (
    <section className="bg-shell-2">
      <div className="wrap py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Chapter n="05" label="This season" />
          <Reveal>
            <span className="label-sm flex items-center gap-2.5 text-muted">
              <Diamond className="text-red" />
              Published by the academy
            </span>
          </Reveal>
        </div>

        <MaskHeading text={'The record keeps\ngetting written'} className="t-display mt-9 max-w-3xl" />

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RESULTS.map((r, i) => (
            <Reveal as="li" key={r.event} delay={i * 60}>
              <article className="flex h-full flex-col border border-rule bg-shell">
                <img
                  src={r.photo}
                  alt={r.event}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="flex flex-1 flex-col p-5">
                  <span className="label-sm nums text-muted">{r.date}</span>
                  <h3 className="display-line t-body mt-3 !leading-[1.05]">
                    {r.event}
                  </h3>
                  <p className="t-body mt-3 text-body">{r.line}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── Approach + numbers + affiliates ─────────────────────────────────────── */

function Approach() {
  const photo = useParallax(44)
  const { openModal } = useModal()

  return (
    <>
      <section className="wrap py-20 md:py-28">
        <Chapter n="06" label="How we train" />
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          <MaskHeading text={'Self-defence,\nnot aggression'} className="t-display" />
          <div className="copy t-lead max-w-2xl">
            <Reveal as="p">{APPROACH_COPY}</Reveal>
          </div>
        </div>

        <Rule className="mt-14" />
        <dl className="grid grid-cols-2 gap-x-8 gap-y-8 py-8 md:grid-cols-4">
          {[
            { v: <Counter to={PROOF.students} suffix="+" />, l: 'Students' },
            { v: <Counter to={PROOF.googleReviews} suffix="+" />, l: '5.0 Google reviews' },
            { v: <Counter to={PROOF.yearsCoaching} suffix=" yr" />, l: 'On the mats' },
            { v: <Counter to={PROOF.affiliates} />, l: 'Affiliate schools in Texas' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 60}>
              <dt className="label mb-3 text-muted">{String(i + 1).padStart(2, '0')}</dt>
              <dd>
                <span className="t-title nums block">{s.v}</span>
                <span className="t-body mt-2 block text-body">{s.l}</span>
              </dd>
            </Reveal>
          ))}
        </dl>

        <Reveal>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="label text-muted">Affiliates</span>
            {AFFILIATES.map((a) => (
              <span key={a} className="t-body flex items-center gap-2.5 text-ink">
                <Diamond className="text-red" />
                {a}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <div className="relative h-[46vw] max-h-[520px] min-h-[280px] overflow-hidden">
        <img
          ref={photo}
          src="/site/team/with-coach.webp"
          alt="Rodrigo Cabral cornering one of the academy's fighters"
          width={1000}
          height={1300}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-[50%_25%] will-change-transform"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(11,12,13,0.8), rgba(11,12,13,0.1))' }}
        />
        <div className="wrap absolute inset-x-0 bottom-0 pb-10">
          <Reveal>
            <p className="prose-quote max-w-xl text-white">
              Rodrigo remains committed to building champions on and off the mats.
            </p>
            <div className="mt-6">
              <Btn onClick={openModal} variant="red">
                Train with the team
              </Btn>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  )
}

export function AboutPage() {
  return (
    <>
      <PageHead
        tag="About the academy"
        title={'More than\na workout'}
        standfirst={ABOUT_OPENER}
      />

      <section className="wrap py-16 md:py-20">
        <Chapter n="01" label="The room" />
        <div className="photo-row mt-10 grid h-[56vw] grid-cols-1 gap-4 sm:h-[32vw] sm:max-h-[440px] sm:grid-cols-[1.4fr_1fr]">
          <Uncover className="h-full">
            <img
              src="/site/home/circle.webp"
              alt="A belt ceremony on the Fight Factory mat"
              width={1800}
              height={1125}
              loading="lazy"
              className="!object-[50%_35%]"
            />
          </Uncover>
          <Uncover delay={90} className="h-full">
            <img
              src="/site/home/rodrigo-mat.webp"
              alt="Rodrigo Cabral on the mat in his black gi"
              width={700}
              height={980}
              loading="lazy"
              className="!object-top"
            />
          </Uncover>
        </div>
      </section>

      <Founder />
      <Values />
      <Staff />
      <Results />
      <Approach />
    </>
  )
}
