import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ComponentType, CSSProperties, FormEvent, InputHTMLAttributes, ReactNode } from 'react'

import { PHONE_ERROR, PHONE_PLACEHOLDER, captureAttribution, formatPhone, isPhone, prefillFromUrl, toE164 } from './attribution'
import { client, copy, copyOf, unitOf, type Copy } from './config'
import {
  dateKey, fetchPrograms, groupPrograms, isPaid, isWaitlist, locale, longDate, noteOf, optionHint, parseKey, shortName, timeLabel, type Program,
} from './programs'
import { adsConversion, fbTrack, gaTrack, identify, startUnit } from './tracking'
import type { Audience, Client } from './types'
import { sendBooking, sendLead, type BookingData } from './webhook'
import './nd.css'

// The booking funnel of every Novo Dash landing page. Identical in all LPs;
// the look comes from the --nd-* CSS variables each page sets.
//   step 1  contact + class  -> Webhook 1, Lead (Pixel + CAPI), generate_lead, Ads Lead
//   step 2  day + time       -> Webhook 2, Schedule (Pixel + CAPI), trial_booked, Ads Trial Booked
// Any link to #book or #start opens the modal; /book renders <BookPage />.
// Multi-unit LP: `unit` (a key of client.ts units) on BookingProvider / BookPage / open() picks the academy.
// Paid trial: `payment` (the LP's checkout component) adds a step between time and confirmation;
// Webhook 2, Schedule and trial_booked wait for its onPaid.

/** What the kit hands the LP's checkout (Stripe...). onPaid only after the charge succeeded. */
export type PaymentProps = { data: BookingData; program: Program; onPaid: () => void; onBack: () => void }

/** Campaign pages can pass their own texts (title, bullets...) on top of the LP's. */
type Options = {
  /** Multi-unit LP: which academy (a key of client.ts units); absent, the first. */
  unit?: string
  source?: string
  audience?: Audience | null
  copy?: Partial<Copy>
  /** Lead only for this page (e.g. a pre-opening campaign); the LP-wide switch is client.booking.leadOnly. */
  leadOnly?: boolean
  /** Extra fields for Webhook 1 on this page (campaign data). */
  leadExtra?: Record<string, unknown>
  /** Class picked on open (a program card's "Book this class"): GHL calendar id. /book also reads ?class=<calendar id>. */
  calendarId?: string
  /** Paid trial: the LP's checkout, shown after the time pick. Absent, the booking is free (as always). */
  payment?: ComponentType<PaymentProps>
}
type Ctx = { open: (options?: Options) => void; close: () => void; isOpen: boolean }

const BookingContext = createContext<Ctx | null>(null)
const CopyContext = createContext<Copy>(copy)
const useCopy = () => useContext(CopyContext)
const UnitContext = createContext<Client>(client)
const useUnit = () => useContext(UnitContext)

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider')
  return ctx
}

export function BookingProvider({ children, unit, source, audience, copy: pageCopy, leadOnly, leadExtra, payment }: { children: ReactNode } & Options) {
  const c = unitOf(unit)
  const [options, setOptions] = useState<Options | null>(null)
  const open = useCallback(
    (o?: Options) => setOptions({ unit, source, audience, copy: pageCopy, leadOnly, leadExtra, payment, ...o }),
    [unit, source, audience, pageCopy, leadOnly, leadExtra, payment],
  )
  const close = useCallback(() => setOptions(null), [])

  useEffect(() => {
    captureAttribution()
    startUnit(c.tracking)
    fetchPrograms(undefined, c).catch(() => {}) // warm the class list; the form reuses this request
  }, [c])

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
    <UnitContext.Provider value={c}>
    <BookingContext.Provider value={value}>
      {children}
      {options ? <BookingModal options={options} onClose={close} /> : null}
    </BookingContext.Provider>
    </UnitContext.Provider>
  )
}

/** The /book route: the modal's two columns as a page. */
export function BookPage({ unit, source, audience, copy: pageCopy, leadOnly, leadExtra, calendarId, payment }: Options) {
  const c = unitOf(unit)
  useEffect(() => {
    captureAttribution()
    startUnit(c.tracking)
  }, [c])
  return (
    <UnitContext.Provider value={c}>
    <CopyContext.Provider value={{ ...copyOf(c), ...pageCopy }}>
      <main className="nd nd-page">
        <div className="nd-dialog is-page">
          <Panel />
          <div className="nd-scroll">
            <BookingForm source={source} audience={audience} leadOnly={leadOnly} leadExtra={leadExtra} calendarId={calendarId} payment={payment} />
          </div>
        </div>
      </main>
    </CopyContext.Provider>
    </UnitContext.Provider>
  )
}

/** Shrinks the text until it fits one line (the address), measured after the LP fonts load. */
function fitLine(el: HTMLElement | null) {
  const fit = () => {
    el!.style.fontSize = ''
    for (let size = 12; size > 9 && el!.scrollWidth > el!.clientWidth; size -= 0.25) el!.style.fontSize = `${size}px`
  }
  if (el) document.fonts.ready.then(fit)
}

/** Brand column: logo, offer, reasons, proof. Collapses to a compact header on phones. */
function Panel() {
  const copy = useCopy()
  const { name, logo, photo, address } = useUnit().academy
  return (
    <aside className="nd-panel" style={photo ? ({ '--nd-photo': `url("${photo}")` } as CSSProperties) : undefined}>
      <div className="nd-panel-head">
        {logo ? <img src={logo} alt={name} className="nd-logo" draggable={false} /> : <p className="nd-wordmark">{name}</p>}
        <p className="nd-eyebrow">{copy.eyebrow}</p>
        <p className="nd-panel-title">{copy.panelTitle}</p>
        <p className="nd-panel-text">{copy.panelText}</p>
        <ul className="nd-bullets">
          {copy.bullets.map((b) => (
            <li key={b}><span className="nd-tick"><Icon d="M5 12.5l4.5 4.5L19 7.5" size={11} /></span>{b}</li>
          ))}
        </ul>
      </div>
      <div className="nd-panel-foot">
        {copy.proof ? <p className="nd-proof"><span aria-hidden="true">★★★★★</span> {copy.proof}</p> : null}
        <p className="nd-panel-name">{name}</p>
        {address ? <p ref={fitLine} className="nd-panel-address">{address}</p> : null}
      </div>
    </aside>
  )
}

function BookingModal({ options, onClose }: { options: Options; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const c = unitOf(options.unit)
  const texts = { ...copyOf(c), ...options.copy }
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
    <UnitContext.Provider value={c}>
    <CopyContext.Provider value={texts}>
    <div className="nd nd-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={texts.formTitle} tabIndex={-1} className="nd-dialog">
        <button type="button" onClick={onClose} aria-label="Close" className="nd-close">
          <Icon d="M6 6l12 12M18 6L6 18" />
        </button>
        <Panel />
        <div className="nd-scroll">
          <BookingForm source={options.source} audience={options.audience} leadOnly={options.leadOnly} leadExtra={options.leadExtra} calendarId={options.calendarId} payment={options.payment} onDone={onClose} />
        </div>
      </div>
    </div>
    </CopyContext.Provider>
    </UnitContext.Provider>
  )
}

type ProgramsState = { status: 'loading' | 'ready' | 'error'; list: Program[] }

/** The funnel itself, for pages that embed it (the /book route, an inline closing section). */
export function BookingForm(props: Options & { onDone?: () => void }) {
  const inherited = useUnit()
  const c = props.unit ? unitOf(props.unit) : inherited
  const { leadExtra, onDone } = props
  const source = props.source === undefined ? c.source : props.source
  const audience = props.audience === undefined ? c.booking.audience : props.audience
  const leadOnly = props.leadOnly === undefined ? c.booking.leadOnly ?? false : props.leadOnly
  const Payment = leadOnly ? undefined : props.payment
  const copy = useCopy()
  const scope = useId()
  const [step, setStep] = useState<1 | 2 | 'pay' | 'done'>(1)
  const [data, setData] = useState<BookingData>(() => ({
    ...prefillFromUrl(c.academy.country), childName: '', calendarId: '', date: '', time: '', preferredAudience: audience ?? '',
  }))
  const [programs, setPrograms] = useState<ProgramsState>({ status: 'loading', list: [] })
  const leadSent = useRef(false)
  const patch = (next: Partial<BookingData>) => setData((prev) => ({ ...prev, ...next }))

  useEffect(() => {
    fbTrack('ViewContent', { content_name: 'Trial Booking' }, undefined, c.tracking)
    gaTrack('view_content', { content_name: 'Trial Booking' }, c.tracking)
    let alive = true
    fetchPrograms(audience, c)
      .then((list) => {
        if (!alive) return
        setPrograms({ status: 'ready', list })
        const wanted = props.calendarId ?? new URLSearchParams(window.location.search).get('class')
        if (list.length) setData((prev) => (prev.calendarId ? prev : { ...prev, calendarId: (list.find((p) => p.calendar_id === wanted) ?? list[0]).calendar_id }))
      })
      .catch(() => alive && setPrograms({ status: 'error', list: [] }))
    return () => {
      alive = false
    }
  }, [audience, c])

  const program = programs.list.find((p) => p.calendar_id === data.calendarId) ?? null
  const isFallback = programs.status !== 'loading' && programs.list.length === 0
  const who = program?.audience ?? data.preferredAudience
  const user = () => ({ name: data.fullName.trim(), email: data.email.trim(), phone: toE164(data.phone, c.academy.country) })

  if (step === 'done') {
    const booked = Boolean(program && data.date && data.time)
    return (
      <Success total={Payment ? 3 : 2} booked={booked} waitlist={isWaitlist(program)} lead={leadOnly} date={data.date} time={data.time} program={program ? shortName(program) : ''}
        name={data.fullName.trim()} onDone={onDone}
        // Another child (or class), same person: back to step 1 with the contact kept; the lead is not sent again.
        another={booked && !leadOnly ? (program?.audience === 'kids' ? 'child' : 'class') : null}
        onAnother={() => { patch({ childName: '', date: '', time: '' }); setStep(1) }} />
    )
  }

  const book = () => {
    fbTrack('Schedule', { content_category: who }, user(), c.tracking)
    gaTrack('trial_booked', { audience: who }, c.tracking)
    adsConversion(c.tracking.adsBookedLabel, c.tracking)
    if (program && data.date && data.time) sendBooking(data, program, source, c)
    setStep('done')
  }

  // Paid trial: only a real slot is charged; the no-times fallback stays a free request, as without payment.
  if (step === 'pay' && Payment && program) {
    return (
      <div className="nd-stack">
        <Head step={3} total={3} title={copy.payTitle}
          text={<><strong>{shortName(program)}</strong> · {longDate(data.date, c.academy.country)} · {timeLabel(data.time)}</>} />
        <Payment data={data} program={program} onPaid={book} onBack={() => setStep(2)} />
      </div>
    )
  }

  if (step === 2) {
    return (
      <Step2
        program={program}
        data={data}
        total={Payment ? 3 : 2}
        paid={Boolean(Payment) || isPaid(program)}
        onChange={patch}
        onBack={() => setStep(1)}
        onConfirm={() => (Payment && program && data.date && data.time ? setStep('pay') : book())}
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
      leadOnly={leadOnly}
      paid={Boolean(Payment)}
      total={Payment ? 3 : 2}
      onNext={() => {
        if (!leadSent.current) {
          // Identify before the Lead fires, or Advanced Matching and Enhanced Conversions miss it.
          leadSent.current = true
          identify(user(), c.tracking)
          sendLead(data, program, source, leadExtra, c)
          fbTrack('Lead', { content_category: who }, user(), c.tracking)
          gaTrack('generate_lead', { audience: who }, c.tracking)
          adsConversion(c.tracking.adsLeadLabel, c.tracking)
        }
        // Waitlist class: the lead is all there is; no calendar, no Webhook 2, no Schedule.
        setStep(isWaitlist(program) || leadOnly ? 'done' : 2)
      }}
    />
  )
}

function Step1({
  scope, data, programs, program, isFallback, leadOnly, paid, total, onChange, onNext,
}: {
  scope: string
  leadOnly: boolean
  paid: boolean
  total: number
  data: BookingData
  programs: ProgramsState
  program: Program | null
  isFallback: boolean
  onChange: (p: Partial<BookingData>) => void
  onNext: () => void
}) {
  const copy = useCopy()
  const country = useUnit().academy.country ?? 'US'
  const [errors, setErrors] = useState<Record<string, string>>({})
  const needsChild = (program?.audience ?? data.preferredAudience) === 'kids'
  // Editing a field clears its own message; the others wait for the next submit.
  const edit = (p: Partial<BookingData>) => {
    onChange(p)
    setErrors((prev) => {
      const next = { ...prev }
      for (const k of Object.keys(p)) delete next[k]
      if ('calendarId' in p || 'preferredAudience' in p) delete next.class
      return next
    })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (data.fullName.trim().length < 2) next.fullName = 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) next.email = 'Please enter a valid email address.'
    if (!isPhone(data.phone, country)) next.phone = PHONE_ERROR[country]
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
      <Head step={1} total={leadOnly ? 1 : total} title={copy.formTitle} text={copy.formText} />
      <div className="nd-stack-sm">
        <Field id={`${scope}-name`} label="Full name" autoComplete="name" placeholder="Jane Doe" value={data.fullName} error={errors.fullName}
          onChange={(e) => edit({ fullName: e.target.value })} />
        <div className="nd-row">
          <Field id={`${scope}-email`} label="Email" type="email" autoComplete="email" placeholder="you@email.com" value={data.email} error={errors.email}
            onChange={(e) => edit({ email: e.target.value })} />
          <Field id={`${scope}-phone`} label="Phone" type="tel" inputMode="tel" autoComplete="tel" placeholder={PHONE_PLACEHOLDER[country]} value={data.phone} error={errors.phone}
            onChange={(e) => edit({ phone: formatPhone(e.target.value, country) })} />
        </div>
      </div>
      <fieldset className="nd-stack-xs">
        <legend className="nd-label">{isFallback ? 'Who is training?' : 'Choose your class'}<span className="nd-req" aria-hidden="true">*</span></legend>
        {programs.status === 'loading' ? (
          <div className="nd-loading" role="status"><span className="nd-spinner" aria-hidden="true" />Loading classes…</div>
        ) : null}
        {programs.status === 'error' ? (
          <p className="nd-note">We could not load the class list just now. Pick adults or kids and we will call you with the times.</p>
        ) : null}
        {isFallback
          ? <div className="nd-options">{(['adults', 'kids'] as const).map((a) =>
              option(a, `${scope}-aud`, data.preferredAudience === a, a === 'adults' ? 'Adults' : 'Kids and teens', null,
                () => edit({ preferredAudience: a, childName: '' })))}</div>
          : groups.map((g) => (
              <div key={g.label} className="nd-options">
                {groups.length > 1 ? <p className="nd-group">{g.label}</p> : null}
                {g.programs.map((p) =>
                  option(p.calendar_id, `${scope}-prog`, p.calendar_id === data.calendarId, shortName(p), optionHint(p),
                    () => edit({ calendarId: p.calendar_id, date: '', time: '' })))}
              </div>
            ))}
        {errors.class ? <p className="nd-error">{errors.class}</p> : null}
      </fieldset>
      {needsChild ? (
        <Field id={`${scope}-child`} label="Your child's first name" value={data.childName} error={errors.childName}
          hint="The child who will be training. You stay as the contact." onChange={(e) => edit({ childName: e.target.value })} />
      ) : null}
      <div className="nd-stack-xs">
        <button type="submit" className="nd-button">{copy.submit || (leadOnly ? copy.confirm : 'Continue')} <Icon d="M5 12h14M13 6l6 6-6 6" size={18} /></button>
        {leadOnly ? null : <p className="nd-foot">Next: pick the day and time of your {paid ? '' : 'free '}class.</p>}
        {copy.consent ? <p className="nd-foot">{copy.consent}</p> : null}
      </div>
    </form>
  )
}

function Step2({
  program, data, total, paid, onChange, onBack, onConfirm,
}: {
  program: Program | null
  data: BookingData
  total: number
  paid: boolean
  onChange: (p: Partial<BookingData>) => void
  onBack: () => void
  onConfirm: () => void
}) {
  const copy = useCopy()
  const { phone, country } = useUnit().academy
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
      <Head step={2} total={total} title={live ? 'Pick your time' : 'Confirm your request'}
        text={program ? <>{paid ? null : 'Free trial class · '}<strong>{shortName(program)}</strong></> : null}
        back={<button type="button" onClick={onBack} className="nd-link">‹ Back</button>} />
      {noteOf(program) ? <p className="nd-note">{noteOf(program)}</p> : null}
      {live && program ? (
        <>
          <Calendar month={month} selected={data.date} bookable={(k) => Boolean(program.slots[k]?.length)}
            onSelect={(k) => onChange({ date: k, time: program.slots[k].length === 1 ? program.slots[k][0] : '' })}
            onMonth={setMonth} />
          {data.date && times.length ? (
            <div className="nd-stack-xs">
              <p className="nd-label">{longDate(data.date, country)}</p>
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
          {phone ? <>, or call the academy on <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a></> : null}.
        </p>
      )}
      <button type="button" disabled={!canConfirm} onClick={onConfirm} className="nd-button">
        {isPaid(program) ? 'Confirm my class' : copy.confirm} <Icon d="M5 12h14M13 6l6 6-6 6" size={18} />
      </button>
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
  const { country } = useUnit().academy
  const monday = country === 'GB' // UK calendars start on Monday
  const y = month.getFullYear()
  const m = month.getMonth()
  const cells: Array<Date | null> = Array.from({ length: (new Date(y, m, 1).getDay() + (monday ? 6 : 0)) % 7 }, () => null)
  for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) cells.push(new Date(y, m, d))
  return (
    <div className="nd-calendar">
      <div className="nd-cal-head">
        <button type="button" aria-label="Previous month" onClick={() => onMonth(new Date(y, m - 1, 1))}>‹</button>
        <span>{month.toLocaleDateString(locale(country), { month: 'long', year: 'numeric' })}</span>
        <button type="button" aria-label="Next month" onClick={() => onMonth(new Date(y, m + 1, 1))}>›</button>
      </div>
      <div className="nd-cal-grid">
        {(monday ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((d, i) => <span key={i} className="nd-cal-dow">{d}</span>)}
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

function Success({
  total, booked, waitlist, lead, date, time, program, name, onDone, another, onAnother,
}: { total: number; booked: boolean; waitlist: boolean; lead: boolean; date: string; time: string; program: string; name: string; onDone?: () => void; another: 'child' | 'class' | null; onAnother: () => void }) {
  // Whoever filled the form reads this (the parent on a kids booking); the email goes to them.
  const copy = useCopy()
  const first = name.split(/\s+/)[0]
  const { address, mapsUrl, country } = useUnit().academy
  return (
    <div className="nd-stack">
      <Head step={total + 1} total={total} title={lead ? copy.doneTitle : waitlist ? "You're on the waitlist" : booked ? "You're booked" : 'We have your request'}
        text={lead
          ? <>{first ? `Thanks, ${first}. ` : ''}{copy.doneText}</>
          : waitlist
          ? <>{first ? `Thanks, ${first}. ` : ''}We will reach out as soon as a spot opens{program ? ` in ${program.split('|')[0].trim()}` : ''}.</>
          : booked
          ? <>{first ? `${first}, a` : 'A'} confirmation is on its way to your email.</>
          : <>{first ? `Thanks, ${first}. ` : ''}We will call you to confirm your class, normally the same day.</>} />
      <ul className="nd-details">
        {booked ? (
          <li><Icon d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" size={18} />
            <span><strong>{longDate(date, country)}</strong><br />{timeLabel(time)}{program ? ` · ${program}` : ''}</span></li>
        ) : null}
        {address ? (
          <li><Icon d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" size={18} />
            <a href={mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">{address}</a></li>
        ) : null}
      </ul>
      {waitlist || lead ? null : (
        <div className="nd-stack-xs">
        <p className="nd-label">Before you come in</p>
        <ul className="nd-tips">
          {copy.tips.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
      )}
      {onDone ? <button type="button" onClick={onDone} className="nd-button">Done</button> : null}
      {another ? <button type="button" onClick={onAnother} className="nd-link nd-another">+ Book another {another}</button> : null}
    </div>
  )
}

function Field({ id, label, error, hint, ...props }: { id: string; label: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="nd-stack-xs">
      <label htmlFor={id} className="nd-label">{label}<span className="nd-req" aria-hidden="true">*</span></label>
      <input id={id} {...props} aria-invalid={error ? true : undefined} className={`nd-input${error ? ' is-error' : ''}`} />
      {hint ? <p className="nd-hint">{hint}</p> : null}
      {error ? <p className="nd-error">{error}</p> : null}
    </div>
  )
}

/** Step bar and title on top of every step. */
function Head({ step, total = 2, title, text, back }: { step: number; total?: number; title: string; text?: ReactNode; back?: ReactNode }) {
  return (
    <header className="nd-head">
      <div className="nd-progress" aria-hidden="true">
        {Array.from({ length: total + 1 }, (_, i) => i + 1).map((n) => <span key={n} className={n <= step ? 'is-on' : undefined} />)}
      </div>
      <p className="nd-step">{step > total ? 'All set' : `Step ${step} of ${total}`}{back}</p>
      <h2 className="nd-title">{title}</h2>
      {text ? <p className="nd-muted">{text}</p> : null}
    </header>
  )
}

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
