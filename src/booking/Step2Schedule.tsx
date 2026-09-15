import { useEffect } from 'react'
import { Calendar } from './Calendar'
import {
  ACADEMY_ADDRESS,
  displayName,
  formatDateLong,
  formatTimeLabel,
  getBookingWindow,
  getFirstBookableDate,
  getTimesForDay,
  isoDate,
} from './schedule'
import type { BookingData } from './types'

interface Step2Props {
  data: BookingData
  onChange: (patch: Partial<BookingData>) => void
  onBack: () => void
  onConfirm: () => void
}

export function Step2Schedule({ data, onChange, onBack, onConfirm }: Step2Props) {
  // Os horários JÁ vieram na chamada única do get_programs (§5.1) — nenhum
  // fetch novo aqui, nenhuma segunda espera, nenhum fallback estático.
  const slots = data.program?.slots ?? {}
  const slotsError = data.program?.slots_error ?? null

  // Ao entrar na Etapa 2: abre no mês da primeira data agendável e pré-seleciona
  // essa data; se o dia tiver UM único horário, ele já vem selecionado (§2).
  useEffect(() => {
    if (!data.program || data.date) return
    const first = getFirstBookableDate(slots)
    if (!first) return
    const times = getTimesForDay(slots, first)
    onChange({ date: first, time: times.length === 1 ? times[0] : null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.program])

  function selectDate(date: Date) {
    const times = getTimesForDay(slots, date)
    // Dia com horário único já vem pré-selecionado — um clique a menos (§2).
    onChange({ date, time: times.length === 1 ? times[0] : null })
  }

  const times = data.date ? getTimesForDay(slots, data.date) : []
  const canConfirm = data.date != null && data.time != null
  const noAvailability = slotsError !== null || getFirstBookableDate(slots) === null
  const initialMonth = data.date ?? getFirstBookableDate(slots) ?? getBookingWindow().min

  return (
    <div className="p-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div
            className="text-[#0A0A0A] mb-1"
            style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.5rem', letterSpacing: '0.01em', textTransform: 'uppercase' }}
          >
            Pick a Date &amp; Time
          </div>
          <p className="text-[#666666] text-sm">{data.program ? displayName(data.program) : ''}</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-[#666666] hover:text-[#0A0A0A] text-sm underline transition-colors cursor-pointer shrink-0 mt-1"
        >
          Back
        </button>
      </div>

      {noAvailability ? (
        // Turma sem horário na janela (ou slots_error): recado com telefone —
        // nunca uma agenda vazia sem explicação (§2 / §5.1).
        <div className="rounded-2xl border border-[#D8D8D8] p-4 text-sm text-[#666666]" role="alert">
          No open times in the next two weeks for this program. Please call us at{' '}
          <a href={`tel:+1${ACADEMY_ADDRESS.phone.replace(/\D/g, '')}`} className="text-[#CC0000] font-semibold">
            {ACADEMY_ADDRESS.phone}
          </a>{' '}
          and we'll find a spot for you.
        </div>
      ) : (
        <>
          <Calendar slots={slots} initialMonth={initialMonth} selected={data.date} onSelect={selectDate} />

          {/* Lista de horários do dia selecionado */}
          <div className="mt-6">
            {!data.date ? (
              <p className="text-[#999999] text-sm text-center py-2">Select a date to see available times.</p>
            ) : times.length === 0 ? (
              <p className="text-[#999999] text-sm text-center py-2">No times available on this day.</p>
            ) : (
              <>
                <span className="block text-[#666666] text-xs mb-2 uppercase tracking-wider">
                  {formatDateLong(data.date)}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {times.map((t) => {
                    const selected = data.time === t
                    return (
                      <button
                        key={`${isoDate(data.date!)}-${t}`}
                        type="button"
                        onClick={() => onChange({ time: t })}
                        aria-pressed={selected}
                        className={[
                          'py-2.5 rounded-full text-sm font-medium border transition-colors cursor-pointer',
                          selected
                            ? 'bg-[#CC0000] text-white border-[#CC0000]'
                            : 'text-[#0A0A0A] border-[#D8D8D8] hover:border-[#0A0A0A]',
                        ].join(' ')}
                      >
                        {formatTimeLabel(t)}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}

      <button
        type="button"
        disabled={!canConfirm}
        onClick={onConfirm}
        className="w-full mt-6 bg-[#CC0000] hover:bg-[#B30000] text-white font-semibold py-3.5 rounded-full transition-all duration-200 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer min-h-[44px]"
        style={{ fontSize: '16px' }}
      >
        Confirm Booking →
      </button>
    </div>
  )
}
