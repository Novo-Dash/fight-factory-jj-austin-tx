import { useEffect, useRef, useState } from 'react'
import {
  GADS_BOOKING,
  GADS_LEAD,
  fbqTrack,
  ga4Event,
  gtagConversion,
  identify,
  setUserData,
} from './analytics'
import { Step1Details } from './Step1Details'
import { Step2Schedule } from './Step2Schedule'
import { formatUSPhone, isStep1Valid } from './validation'
import { Success } from './Success'
import { fetchPrograms, sendBookingWebhook, sendLeadWebhook, toE164 } from './webhook'
import type { BookingData } from './types'
import type { Program } from './schedule'

type Step = 1 | 2 | 'success'

/** Estado da busca ao vivo de turmas (get_programs, §5.1). O estado inicial é
 *  'loading' ANTES do primeiro paint — nunca pinta lista de estado antigo
 *  (§8 item 15). Não existe lista estática de fallback. */
export type ProgramsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; programs: Program[] }

/** Pré-preenchimento via query string (links do GHL com merge fields). */
function readPrefill(): Partial<BookingData> {
  const params = new URLSearchParams(window.location.search)
  const out: Partial<BookingData> = {}
  // Ignora merge tag não resolvida ({{ ou }}) e valores vazios.
  const clean = (v: string | null) => (v && !v.includes('{{') && !v.includes('}}') ? v.trim() : '')

  const name = clean(params.get('full_name'))
  if (name) out.name = name

  const email = clean(params.get('email'))
  if (email) out.email = email

  const rawPhone = clean(params.get('phone'))
  if (rawPhone) {
    let digits = rawPhone.replace(/\D/g, '')
    // GHL manda E.164 (+15555555555) → remove o código de país antes de formatar.
    if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
    // Número que não é US de 10 dígitos fica cru (a máscara truncaria dígitos).
    out.phone = digits.length === 10 ? formatUSPhone(digits) : rawPhone
  }
  return out
}

function makeInitial(): BookingData {
  return {
    name: '',
    email: '',
    phone: '',
    program: null, // a lista vem AO VIVO do GHL (§5.1); o usuário escolhe
    childName: '',
    date: null,
    time: null,
    ...readPrefill(), // leitura única no mount; edições do usuário sempre vencem
  }
}

interface BookingFormProps {
  /** Chamado após o reset, ao concluir. No modal: fecha. No /book: undefined (fica na Etapa 1). */
  onDone?: () => void
  /** /kids e /back-to-school: restringe as turmas visíveis às de kids. */
  kidsMode?: boolean
  /** Rótulo de origem gravado nos 2 webhooks. Omitido = landing page. */
  source?: string
}

export function BookingForm({ onDone, kidsMode, source }: BookingFormProps) {
  const [step, setStep] = useState<Step>(1)
  const [data, setData] = useState<BookingData>(() => makeInitial())
  // Loading marcado ANTES do primeiro paint (§8 item 15).
  const [programs, setPrograms] = useState<ProgramsState>({ status: 'loading' })
  const leadSent = useRef(false) // dedupe do Webhook 1 (1x por sessão de booking)

  // Busca turmas + horários AO VIVO no GHL ao montar (abrir modal / montar
  // /book) — uma chamada só, cacheada por sessão no módulo webhook (§5.1).
  useEffect(() => {
    let cancelled = false
    fetchPrograms()
      .then((list) => {
        if (!cancelled) setPrograms({ status: 'ready', programs: list })
      })
      .catch(() => {
        if (!cancelled) setPrograms({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  function patch(p: Partial<BookingData>) {
    setData((prev) => ({ ...prev, ...p }))
  }

  function handleNext() {
    if (!isStep1Valid(data)) return
    // Webhook 1 + conversões de Lead: 1x por sessão, mesmo se voltar e avançar.
    if (!leadSent.current) {
      leadSent.current = true
      const audience = data.program?.audience
      // Advanced Matching (§7.6.4): identifica ANTES dos eventos de Lead.
      identify({ name: data.name, email: data.email, phone: data.phone })
      // Enhanced Conversions: setar antes da conversão de Lead cobre as duas da sessão.
      setUserData(data.email, toE164(data.phone))
      sendLeadWebhook(data, source) // fire-and-forget
      fbqTrack('Lead', { content_category: audience })
      ga4Event('generate_lead', { audience })
      gtagConversion(GADS_LEAD)
    }
    setStep(2)
  }

  function handleConfirm() {
    if (data.program == null || data.date == null || data.time == null) return
    const audience = data.program.audience
    fbqTrack('Schedule', { content_category: audience }) // sem value — trial é grátis
    ga4Event('trial_booked', { audience })
    gtagConversion(GADS_BOOKING)
    sendBookingWebhook(data, source) // fire-and-forget
    setStep('success')
  }

  function handleDone() {
    setData(makeInitial())
    setStep(1)
    leadSent.current = false
    onDone?.()
  }

  if (step === 'success') return <Success data={data} onDone={handleDone} />
  if (step === 2) {
    return <Step2Schedule data={data} onChange={patch} onBack={() => setStep(1)} onConfirm={handleConfirm} />
  }
  return (
    <Step1Details
      data={data}
      programs={programs}
      onChange={patch}
      onNext={handleNext}
      kidsMode={kidsMode}
    />
  )
}
