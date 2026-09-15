import { useEffect, useRef } from 'react'
import { ACADEMY_ADDRESS, displayName, type Program } from './schedule'
import { formatUSPhone, isStep1Valid } from './validation'
import type { BookingData } from './types'
import type { ProgramsState } from './BookingForm'

interface Step1Props {
  data: BookingData
  /** Turmas AO VIVO do GHL (get_programs, §5.1) — loading / error / ready. */
  programs: ProgramsState
  onChange: (patch: Partial<BookingData>) => void
  onNext: () => void
  /** /kids e /back-to-school: restringe os programas visíveis aos de kids. */
  kidsMode?: boolean
}

const inputClass =
  'w-full px-4 py-3 rounded-full text-[#0A0A0A] border border-[#D8D8D8] focus:border-[#0A0A0A] focus:outline-none transition-colors'

/** Dica curta abaixo do nome (só UI, nada disso vai em payload). */
function programHint(p: Program): string {
  const parts: string[] = []
  if (p.duration_minutes) parts.push(`${p.duration_minutes} min`)
  parts.push(p.audience === 'kids' ? 'Kids' : 'Adults')
  return parts.join(' · ')
}

export function Step1Details({ data, programs, onChange, onNext, kidsMode }: Step1Props) {
  const valid = isStep1Valid(data)
  // audience vem do GHL (grupo do calendário) — nunca recalculado pelo nome (§8.22).
  const isKids = data.program?.audience === 'kids'

  const visiblePrograms =
    programs.status === 'ready'
      ? kidsMode
        ? programs.programs.filter((p) => p.audience === 'kids')
        : programs.programs
      : []

  // Quando o campo "nome da criança" aparece (troca p/ programa de kids),
  // rola até ele + foca. Só na transição para kids, não a cada render.
  const childRef = useRef<HTMLInputElement>(null)
  const prevKids = useRef(isKids)
  useEffect(() => {
    if (isKids && !prevKids.current) {
      childRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      childRef.current?.focus({ preventScroll: true })
    }
    prevKids.current = isKids
  }, [isKids])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (valid) onNext()
  }

  function selectProgram(p: Program) {
    onChange({
      program: p,
      // troca de turma zera a agenda; sair de kids descarta nome de criança antigo
      date: null,
      time: null,
      ...(p.audience === 'kids' ? {} : { childName: '' }),
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div
          className="text-[#0A0A0A] mb-1"
          style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.75rem', letterSpacing: '0.01em', textTransform: 'uppercase' }}
        >
          Book Your Free Trial Class
        </div>
        <p className="text-[#666666] text-sm">No commitment · No experience required</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seu nome (responsável) — sempre. É o nome do contato no GHL. */}
        <div>
          <label htmlFor="bk-name" className="block text-[#666666] text-xs mb-1.5 uppercase tracking-wider">
            Your Name
          </label>
          <input
            id="bk-name"
            name="name"
            type="text"
            required
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className={inputClass}
            style={{ background: '#F5F5F5', fontSize: '16px' }}
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="bk-email" className="block text-[#666666] text-xs mb-1.5 uppercase tracking-wider">
            Email
          </label>
          <input
            id="bk-email"
            name="email"
            type="email"
            required
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className={inputClass}
            style={{ background: '#F5F5F5', fontSize: '16px' }}
            placeholder="you@email.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="bk-phone" className="block text-[#666666] text-xs mb-1.5 uppercase tracking-wider">
            Phone
          </label>
          <input
            id="bk-phone"
            name="phone"
            type="tel"
            required
            value={data.phone}
            onChange={(e) => onChange({ phone: formatUSPhone(e.target.value) })}
            className={inputClass}
            style={{ background: '#F5F5F5', fontSize: '16px' }}
            placeholder="(512) 000-0000"
            autoComplete="tel"
            inputMode="numeric"
            maxLength={14}
          />
        </div>

        {/* Programa — radios a partir da lista AO VIVO do GHL (§5.1). */}
        <div>
          <span className="block text-[#666666] text-xs mb-2 uppercase tracking-wider">Program</span>

          {programs.status === 'loading' && (
            // Loading ANTES de pintar — nada de lista estática (§8 item 15).
            <div className="flex items-center justify-center gap-3 py-8" role="status">
              <span className="w-5 h-5 rounded-full border-2 border-[#E5E5E5] border-t-[#CC0000] animate-spin" />
              <span className="text-[#999999] text-sm">Loading programs…</span>
            </div>
          )}

          {(programs.status === 'error' ||
            (programs.status === 'ready' && visiblePrograms.length === 0)) && (
            <div className="rounded-2xl border border-[#D8D8D8] p-4 text-sm text-[#666666]" role="alert">
              We couldn't load our programs right now. Please call us at{' '}
              <a href={`tel:+1${ACADEMY_ADDRESS.phone.replace(/\D/g, '')}`} className="text-[#CC0000] font-semibold">
                {ACADEMY_ADDRESS.phone}
              </a>{' '}
              and we'll get you on the mat.
            </div>
          )}

          {programs.status === 'ready' && visiblePrograms.length > 0 && (
            <div className="space-y-2.5">
              {visiblePrograms.map((p) => {
                const checked = data.program?.calendar_id === p.calendar_id
                return (
                  <label
                    key={p.calendar_id}
                    className={[
                      'flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors',
                      checked ? 'border-[#CC0000] bg-[#FFF5F5]' : 'border-[#D8D8D8] hover:border-[#0A0A0A]',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="program"
                      value={p.calendar_id}
                      checked={checked}
                      onChange={() => selectProgram(p)}
                      className="sr-only"
                    />
                    <span
                      className={[
                        'mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                        checked ? 'border-[#CC0000]' : 'border-[#BBBBBB]',
                      ].join(' ')}
                    >
                      {checked && <span className="w-2 h-2 rounded-full bg-[#CC0000]" />}
                    </span>
                    <span>
                      <span className="block text-[#0A0A0A] font-semibold text-sm">{displayName(p)}</span>
                      <span className="block text-[#666666] text-xs">{programHint(p)}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* Nome da criança — só quando o programa é de kids. */}
        {isKids && (
          <div>
            <label htmlFor="bk-child" className="block text-[#666666] text-xs mb-1.5 uppercase tracking-wider">
              Child's Name
            </label>
            <input
              ref={childRef}
              id="bk-child"
              name="childName"
              type="text"
              required
              value={data.childName ?? ''}
              onChange={(e) => onChange({ childName: e.target.value })}
              className={inputClass}
              style={{ background: '#F5F5F5', fontSize: '16px' }}
              placeholder="Child's full name"
              autoComplete="off"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!valid}
          className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-semibold py-3.5 rounded-full transition-all duration-200 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer min-h-[44px]"
          style={{ fontSize: '16px' }}
        >
          Continue →
        </button>
      </form>
    </div>
  )
}
