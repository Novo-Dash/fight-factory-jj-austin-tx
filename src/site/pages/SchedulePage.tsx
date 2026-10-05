import { useMemo, useState } from 'react'
import { useModal } from '../hooks/useSiteModal'
import { MaskHeading } from '../components/MaskHeading'
import { PageHead } from '../components/PageHead'
import { Reveal } from '../components/motion'
import { Btn, Chapter, Diamond, Rule } from '../components/ui'
import { Icon, type IconName } from '../components/Icon'
import {
  DAYS,
  TRACKS,
  WEEKLY_CLASS_COUNT,
  slotsForDay,
  type Track,
} from '../content/schedule'
import { ACADEMY, SCHEDULE_COPY } from '../content/site'

const TRACK_ICON: Record<Track, IconName> = {
  gi: 'gi',
  nogi: 'nogi',
  kids: 'kids',
  womens: 'belt',
  wrestling: 'wrestling',
}

/** A single class. Same component in the grid and in the mobile list. */
function Slot({
  slot,
  dim,
}: {
  slot: { start: string; end: string; name: string; note?: string; track: Track }
  dim?: boolean
}) {
  return (
    <div
      className={`border-l-2 bg-shell px-3 py-3 transition-opacity duration-300 ${
        dim ? 'opacity-25' : ''
      }`}
      style={{ borderLeftColor: 'var(--color-red)' }}
    >
      <p className="label nums flex items-center gap-2 text-ink">
        <span>{slot.start}</span>
        <span className="text-rule">–</span>
        <span className="font-normal text-muted">{slot.end}</span>
      </p>
      <p className="display-line t-body mt-2 flex items-start gap-2 !leading-[1.1]">
        <Icon name={TRACK_ICON[slot.track]} size={17} className="mt-[1px] shrink-0" />
        {slot.name}
      </p>
      {slot.note ? <p className="label-sm mt-2 text-muted">{slot.note}</p> : null}
    </div>
  )
}

export function SchedulePage() {
  const { openModal } = useModal()
  const [active, setActive] = useState<Track[]>([])
  // 0 = Sunday in JS; the timetable is 1 = Monday … 6 = Saturday.
  const today = useMemo(() => new Date().getDay(), [])

  const filter = active.length ? active : null
  function toggle(t: Track) {
    setActive((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const shown = useMemo(
    () => DAYS.reduce((n, d) => n + slotsForDay(d.n, filter).length, 0),
    [filter],
  )

  return (
    <>
      <PageHead
        tag="Class schedule"
        title={'Class schedules\nthat work\naround you'}
        standfirst="Mornings, midday and evenings, Monday to Saturday. Gi and no-gi every week, kids from four, and a beginners-only class on Friday."
        aside={
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
            {[
              { v: String(WEEKLY_CLASS_COUNT), l: 'Classes each week' },
              { v: '6', l: 'Training days' },
              { v: '7:00 AM', l: 'Earliest class' },
              { v: '8:30 PM', l: 'Latest finish' },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 60}>
                <dt className="label mb-3 text-muted">{String(i + 1).padStart(2, '0')}</dt>
                <dd>
                  <span className="display-line t-sub nums block">{s.v}</span>
                  <span className="t-body mt-1.5 block text-body">{s.l}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
        }
      />

      {/* ── The grid ─────────────────────────────────────────────────────── */}
      <section className="wrap py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <Chapter n="01" label="The week" />
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              <span className="label mr-1 text-muted">Filter</span>
              {TRACKS.map((t) => {
                const on = active.includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    aria-pressed={on}
                    className={`label-sm inline-flex min-h-[44px] items-center gap-2 border px-3 transition-colors duration-200 ${
                      on
                        ? 'border-red bg-red text-white'
                        : 'border-rule text-body hover:border-ink hover:text-ink'
                    }`}
                  >
                    <Icon name={TRACK_ICON[t.id]} size={15} />
                    {t.label}
                  </button>
                )
              })}
              {active.length ? (
                <button
                  type="button"
                  onClick={() => setActive([])}
                  className="label-sm min-h-[44px] px-3 text-muted underline decoration-rule underline-offset-4 hover:text-ink"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal>
          <p className="label-sm nums mt-7 text-muted" aria-live="polite">
            Showing {shown} of {WEEKLY_CLASS_COUNT} classes
          </p>
        </Reveal>

        {/* Desktop: six columns. Wide content scrolls inside its own box, so
            the page body never scrolls sideways. */}
        <div className="mt-6 hidden overflow-x-auto pb-2 sm:block [scrollbar-width:thin]">
          <div className="grid min-w-[860px] grid-cols-6 gap-3">
            {DAYS.map((d) => {
              const slots = slotsForDay(d.n, filter)
              const isToday = today === d.n
              return (
                <div key={d.n}>
                  <div
                    className={`rule-ticks flex items-baseline justify-between gap-2 pb-4 pt-4 ${
                      isToday ? '' : ''
                    }`}
                  >
                    <h3 className="display-line t-body">
                      {d.short}
                    </h3>
                    {isToday ? (
                      <span className="label-sm flex items-center gap-1.5 text-red">
                        <Diamond className="text-red" />
                        Today
                      </span>
                    ) : (
                      <span className="label-sm nums text-muted">{slots.length}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {slots.length ? (
                      slots.map((s, i) => <Slot key={`${s.name}${i}`} slot={s} />)
                    ) : (
                      <p className="label-sm border border-dashed border-rule px-3 py-4 text-muted">
                        No matching class
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile: day by day, no sideways scroll at all. */}
        <div className="mt-6 sm:hidden">
          {DAYS.map((d) => {
            const slots = slotsForDay(d.n, filter)
            const isToday = today === d.n
            return (
              <div key={d.n} className="rule-ticks pb-6 pt-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 className="t-sub">{d.label}</h3>
                  {isToday ? (
                    <span className="label-sm flex items-center gap-1.5 text-red">
                      <Diamond className="text-red" />
                      Today
                    </span>
                  ) : (
                    <span className="label-sm nums text-muted">{slots.length} classes</span>
                  )}
                </div>
                {slots.length ? (
                  <div className="flex flex-col gap-2">
                    {slots.map((s, i) => (
                      <Slot key={`${s.name}${i}`} slot={s} />
                    ))}
                  </div>
                ) : (
                  <p className="label-sm text-muted">No matching class</p>
                )}
              </div>
            )
          })}
        </div>

        <Rule className="mt-2" />
        <div className="flex flex-wrap items-center justify-between gap-6 py-7">
          <p className="label flex items-center gap-2.5 text-muted">
            <Diamond className="text-red" />
            Closed Sundays
          </p>
          <p className="label-sm max-w-xl text-muted">
            Times are the academy&rsquo;s published schedule. The trial booking calendar shows
            live availability class by class.
          </p>
        </div>
      </section>

      {/* ── Book it ──────────────────────────────────────────────────────── */}
      <section className="bg-ink text-white">
        <div className="wrap py-20 md:py-24">
          <Chapter n="02" label="Book a slot" invert />
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16">
            <MaskHeading text={'Pick a class,\npick a time'} className="t-display text-white" />
            <Reveal>
              <p className="standfirst text-white/60">
                The booking form pulls real availability from the academy&rsquo;s calendar, so the
                time you choose is a time a coach is expecting you.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Btn onClick={openModal}>Book a free trial</Btn>
                <a href={ACADEMY.phoneHref} className="btn btn-ghost-invert">
                  <Icon name="phone" size={16} />
                  <span className="nums">{ACADEMY.phone}</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── The academy's own words about training here ──────────────────── */}
      <section className="wrap py-20 md:py-24">
        <Chapter n="03" label="Start your journey today" />
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <MaskHeading text={'Everyone has\nthe capacity\nfor success'} className="t-display" />
          <div className="copy t-lead max-w-2xl">
            <Reveal as="p">{SCHEDULE_COPY}</Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
