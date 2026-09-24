import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'

import { captureAttribution, formatPhone, prefillFromUrl, toE164 } from './attribution'
import { client, copy } from './config'
import {
  ageHint, dateKey, fetchPrograms, groupPrograms, longDate, parseKey, shortName, timeLabel, type Program,
} from './programs'
import { adsConversion, fbTrack, gaTrack, identify } from './tracking'
import type { Audience } from './types'
import { sendBooking, sendLead, type BookingData } from './webhook'
import './nd.css'

// The booking funnel of every Novo Dash landing page. Identical in all LPs;
// the look comes from the --nd-* CSS variables each page sets.
//   step 1  contact + class  -> Webhook 1, Lead (Pixel + CAPI), generate_lead, Ads Lead
//   step 2  day + time       -> Webhook 2, Schedule (Pixel + CAPI), trial_booked, Ads Trial Booked
// Any link to #book or #start opens the modal; /book renders <BookPage />.

type Options = { source?: string; audience?: Audience | null }
type Ctx = { open: (options?: Options) => void; close: () => void; isOpen: boolean }

const BookingContext = createContext<Ctx | null>(null)

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider')
  return ctx
}

export function BookingProvider({ children, source, audience }: { children: ReactNode } & Options) {
  const [options, setOptions] = useState<Options | null>(null)
  const open = useCallback((o?: Options) => setOptions({ source, audience, ...o }), [source, audience])
  const close = useCallback(() => setOptions(null), [])

  useEffect(() => captureAttribution(), [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return
      const href = (e.target as HTMLElement | null)?.closest('a')?.getAttribute('href')
      if (href !== '#book' && href !== '#start') return
      e.preventDefault()
      open()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [open])

  const value = useMemo(() => ({ open, close, isOpen: options !== null }), [open, close, options])
  return (
    <BookingContext.Provider value={value}>
      {children}
      {options ? <BookingModal options={options} onClose={close} /> : null}
    </BookingContext.Provider>
  )
}

/** The /book route: same form, full page. */
export function BookPage({ source, audience }: Options) {
  useEffect(() => captureAttribution(), [])
  return (
    <main className="nd nd-page">
      <div className="nd-card">
        <BookingForm source={source} audience={audience} />
      </div>
    </main>
  )
}

function BookingModal({ options, onClose }: { options: Options; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    ref.current?.focus()
    const { body } = document
    const prev = [body.style.overflow, body.style.paddingRight]
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      document.removeEventListener('keydown', onKey)
      ;[body.style.overflow, body.style.paddingRight] = prev
    }
  }, [onClose])

  return (
    <div className="nd nd-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={copy.formTitle} tabIndex={-1} className="nd-dialog">
        <button type="button" onClick={onClose} aria-label="Close" className="nd-close">
          <Icon d="M6 6l12 12M18 6L6 18" />
        </button>
        <aside className="nd-panel">
          <p className="nd-panel-title">{copy.panelTitle}</p>
          <p className="nd-panel-text">{copy.panelText}</p>
          <p className="nd-panel-name">{client.academy.name}</p>
        </aside>
        <div className="nd-scroll">
          <BookingForm source={options.source} audience={options.audience} />
        </div>
      </div>
    </div>
  )
}

type ProgramsState = { status: 'loading' | 'ready' | 'error'; list: Program[] }

/** The funnel itself, for pages that embed it (the /book route, an inline closing section). */
export function BookingForm({ source = client.source, audience = client.booking.audience }: Options) {
  const scope = useId()
  const [step, setStep] = useState<1 | 2 | 'done'>(1)
  const [data, setData] = useState<BookingData>(() => ({
    ...prefillFromUrl(), childName: '', calendarId: '', date: '', time: '', preferredAudience: '',
  }))
  const [programs, setPrograms] = useState<ProgramsState>({ status: 'loading', list: [] })
  const leadSent = useRef(false)
  const patch = (next: Partial<BookingData>) => setData((prev) => ({ ...prev, ...next }))

  useEffect(() => {
    fbTrack('ViewContent', { content_name: 'Trial Booking' })
    gaTrack('view_content', { content_name: 'Trial Booking' })
    let alive = true
    fetchPrograms(audience)
      .then((list) => {
        if (!alive) return
        setPrograms({ status: 'ready', list })
        if (list.length) setData((prev) => (prev.calendarId ? prev : { ...prev, calendarId: list[0].calendar_id }))
      })
      .catch(() => alive && setPrograms({ status: 'error', list: [] }))
    return () => {
      alive = false
    }
  }, [audience])

  const program = programs.list.find((p) => p.calendar_id === data.calendarId) ?? null
  const isFallback = programs.status !== 'loading' && programs.list.length === 0
  const who = program?.audience ?? data.preferredAudience
  const user = () => ({ name: data.fullName.trim(), email: data.email.trim(), phone: toE164(data.phone) })

  if (step === 'done') {
    const booked = Boolean(program && data.date && data.time)
    return <Success booked={booked} date={data.date} time={data.time} student={data.childName.trim() || data.fullName.trim()} />
  }

  if (step === 2) {
    return (
      <Step2
        program={program}
        data={data}
        onChange={patch}
        onBack={() => setStep(1)}
        onConfirm={() => {
          fbTrack('Schedule', { content_category: who }, user())
          gaTrack('trial_booked', { audience: who })
          adsConversion(client.tracking.adsBookedLabel)
          if (program && data.date && data.time) sendBooking(data, program, source)
          setStep('done')
        }}
      />
    )
  }

  return (
    <Step1
      scope={scope}
      data={data}
      programs={programs}
      program={program}
      isFallback={isFallback}
      onChange={patch}
      onNext={() => {
        if (!leadSent.current) {
          // Identify before the Lead fires, or Advanced Matching and Enhanced Conversions miss it.
          leadSent.current = true
          identify(user())
          sendLead(data, program, source)
          fbTrack('Lead', { content_category: who }, user())
          gaTrack('generate_lead', { audience: who })
          adsConversion(client.tracking.adsLeadLabel)
        }
        setStep(2)
      }}
    />
  )
}

function Step1({
  scope, data, programs, program, isFallback, onChange, onNext,
}: {
  scope: string
  data: BookingData
  programs: ProgramsState
  program: Program | null
  isFallback: boolean
  onChange: (p: Partial<BookingData>) => void
  onNext: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const needsChild = (program?.audience ?? data.preferredAudience) === 'kids'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (data.fullName.trim().length < 2) next.fullName = 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) next.email = 'Please enter a valid email address.'
    if (data.phone.replace(/\D/g, '').length < 10) next.phone = 'Please enter a 10 digit phone number.'
    if (isFallback ? !data.preferredAudience : !program) next.class = isFallback ? 'Please choose adults or kids.' : 'Please choose a class.'
    if (needsChild && data.childName.trim().length < 2) next.childName = "Please enter your child's first name."
    setErrors(next)
    if (!Object.keys(next).length) onNext()
  }

  const option = (key: string, name: string, active: boolean, title: string, hint: string | null, onPick: () => void) => (
    <label key={key} className={`nd-option${active ? ' is-active' : ''}`}>
      <input type="radio" name={name} checked={active} onChange={onPick} />
      <span>
        <span className="nd-option-title">{title}</span>
        {hint ? <span className="nd-option-hint">{hint}</span> : null}
      </span>
    </label>
  )

  const groups = groupPrograms(programs.list)
  return (
    <form onSubmit={submit} noValidate className="nd-stack">
      <header>
        <h2 className="nd-title">{copy.formTitle}</h2>
        <p className="nd-muted">Tell us who is training and we will hold a spot.</p>
      </header>
      <div className="nd-stack-sm">
        <Field id={`${scope}-name`} label="Full name" autoComplete="name" value={data.fullName} error={errors.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })} />
        <Field id={`${scope}-email`} label="Email" type="email" autoComplete="email" value={data.email} error={errors.email}
          onChange={(e) => onChange({ email: e.target.value })} />
        <Field id={`${scope}-phone`} label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={data.phone} error={errors.phone}
          hint="So we can confirm your class." onChange={(e) => onChange({ phone: formatPhone(e.target.value) })} />
      </div>
      <fieldset className="nd-stack-sm">
        <legend className="nd-label">{isFallback ? 'Who is training?' : 'Choose the class'}</legend>
        {programs.status === 'loading' ? <div className="nd-skeleton" aria-hidden="true" /> : null}
        {programs.status === 'error' ? (
          <p className="nd-note">We could not load the class list just now. Pick adults or kids and we will call you with the times.</p>
        ) : null}
        {isFallback
          ? (['adults', 'kids'] as const).map((a) =>
              option(a, `${scope}-aud`, data.preferredAudience === a, a === 'adults' ? 'Adults' : 'Kids and teens', null,
                () => onChange({ preferredAudience: a, childName: '' })))
          : groups.map((g) => (
              <div key={g.label} className="nd-stack-xs">
                {groups.length > 1 ? <p className="nd-group">{g.label}</p> : null}
                {g.programs.map((p) =>
                  option(p.calendar_id, `${scope}-prog`, p.calendar_id === data.calendarId, shortName(p), ageHint(p),
                    () => onChange({ calendarId: p.calendar_id, date: '', time: '' })))}
              </div>
            ))}
        {errors.class ? <p className="nd-error">{errors.class}</p> : null}
      </fieldset>
      {needsChild ? (
        <Field id={`${scope}-child`} label="Your child's first name" value={data.childName} error={errors.childName}
          hint="The child who will be training. You stay as the contact." onChange={(e) => onChange({ childName: e.target.value })} />
      ) : null}
      <button type="submit" className="nd-button">Continue</button>
    </form>
  )
}

function Step2({
  program, data, onChange, onBack, onConfirm,
}: {
  program: Program | null
  data: BookingData
  onChange: (p: Partial<BookingData>) => void
  onBack: () => void
  onConfirm: () => void
}) {
  const days = program ? Object.keys(program.slots).sort() : []
  const [month, setMonth] = useState(() => (days[0] ? parseKey(days[0]) : new Date()))

  // Open on the first day with a class; a day with a single time is picked for them.
  useEffect(() => {
    if (!program || !days[0]) return
    setMonth(parseKey(days[0]))
    onChange({ date: days[0], time: program.slots[days[0]].length === 1 ? program.slots[days[0]][0] : '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program?.calendar_id])

  const times = program && data.date ? (program.slots[data.date] ?? []) : []
  const live = Boolean(program && days.length)
  const canConfirm = live ? Boolean(data.date && data.time) : true

  return (
    <div className="nd-stack">
      <button type="button" onClick={onBack} className="nd-link">‹ Back to your details</button>
      <header>
        <h2 className="nd-title">{live ? 'Pick your time' : 'Confirm your request'}</h2>
        {program ? <p className="nd-muted">Free trial class for <strong>{shortName(program)}</strong></p> : null}
      </header>
      {live && program ? (
        <>
          <Calendar month={month} selected={data.date} bookable={(k) => Boolean(program.slots[k]?.length)}
            onSelect={(k) => onChange({ date: k, time: program.slots[k].length === 1 ? program.slots[k][0] : '' })}
            onMonth={setMonth} />
          {data.date && times.length ? (
            <div className="nd-stack-xs">
              <p className="nd-label">Open times on {longDate(data.date)}</p>
              <div className="nd-times">
                {times.map((t) => (
                  <button key={t} type="button" aria-pressed={t === data.time} onClick={() => onChange({ time: t })}
                    className={`nd-time${t === data.time ? ' is-active' : ''}`}>{timeLabel(t)}</button>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p className="nd-note">
          We cannot show the open class times right now. Confirm and we will call you with a day and a time
          {client.academy.phone ? <>, or call the academy on <a href={`tel:${client.academy.phone.replace(/[^\d+]/g, '')}`}>{client.academy.phone}</a></> : null}.
        </p>
      )}
      <button type="button" disabled={!canConfirm} onClick={onConfirm} className="nd-button">{copy.confirm}</button>
    </div>
  )
}

function Calendar({
  month, selected, bookable, onSelect, onMonth,
}: {
  month: Date
  selected: string
  bookable: (key: string) => boolean
  onSelect: (key: string) => void
  onMonth: (d: Date) => void
}) {
  const y = month.getFullYear()
  const m = month.getMonth()
  const cells: Array<Date | null> = Array.from({ length: new Date(y, m, 1).getDay() }, () => null)
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) cells.push(new Date(y, m, d))
  return (
    <div className="nd-calendar">
      <div className="nd-cal-head">
        <button type="button" aria-label="Previous month" onClick={() => onMonth(new Date(y, m - 1, 1))}>‹</button>
        <span>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button type="button" aria-label="Next month" onClick={() => onMonth(new Date(y, m + 1, 1))}>›</button>
      </div>
      <div className="nd-cal-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="nd-cal-dow">{d}</span>)}
        {cells.map((day, i) => {
          if (!day) return <span key={i} />
          const key = dateKey(day)
          const ok = bookable(key)
          return (
            <button key={i} type="button" disabled={!ok} aria-label={key} aria-pressed={key === selected}
              onClick={() => onSelect(key)} className={`nd-day${key === selected ? ' is-active' : ''}`}>
              {day.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Success({ booked, date, time, student }: { booked: boolean; date: string; time: string; student: string }) {
  const first = student.split(/\s+/)[0]
  const { address, mapsUrl } = client.academy
  return (
    <div className="nd-stack">
      <h2 className="nd-title">{booked ? 'Your spot is booked' : 'We have your request'}</h2>
      <p className="nd-muted">
        {booked ? (
          <>{first ? `${first}, we` : 'We'} will see you on <strong>{longDate(date)}</strong> at <strong>{timeLabel(time)}</strong>. A confirmation is on its way to your email.</>
        ) : (
          <>{first ? `Thanks, ${first}. ` : ''}We will call you to confirm your class, normally the same day.</>
        )}
      </p>
      <div className="nd-box nd-stack-xs">
        <p className="nd-label">Before you come in</p>
        <p className="nd-muted">Wear a t-shirt and shorts, bring water, and arrive a few minutes early so someone can show you around.</p>
        {address ? <a href={mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">{address}</a> : null}
      </div>
    </div>
  )
}

function Field({ id, label, error, hint, ...props }: { id: string; label: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="nd-stack-xs">
      <label htmlFor={id} className="nd-label">{label}</label>
      <input id={id} {...props} aria-invalid={error ? true : undefined} className={`nd-input${error ? ' is-error' : ''}`} />
      {hint ? <p className="nd-hint">{hint}</p> : null}
      {error ? <p className="nd-error">{error}</p> : null}
    </div>
  )
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
