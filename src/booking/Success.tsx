import { ACADEMY_ADDRESS, formatDateLong, formatTimeLabel } from './schedule'
import type { BookingData } from './types'

interface SuccessProps {
  data: BookingData
}

export function Success({ data }: SuccessProps) {
  return (
    <div className="p-8 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'rgba(204,0,0,0.08)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M5 12L10 17L19 8" stroke="#CC0000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h3
        className="text-[#0A0A0A] mb-2"
        style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.75rem', letterSpacing: '0.01em', textTransform: 'uppercase' }}
      >
        You're Booked!
      </h3>

      {data.date && data.time && (
        <p className="text-[#0A0A0A] text-sm font-semibold mb-1">
          {formatDateLong(data.date)} · {formatTimeLabel(data.time)}
        </p>
      )}
      <p className="text-[#666666] text-sm mb-6" style={{ lineHeight: '1.65' }}>
        We'll see you on the mats. Check your email and SMS for confirmation details.
      </p>

      {/* Endereço da academia */}
      <a
        href={ACADEMY_ADDRESS.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-left rounded-2xl border border-[#D8D8D8] p-4 mb-6 hover:border-[#0A0A0A] transition-colors"
      >
        <span className="block text-[#0A0A0A] font-semibold text-sm mb-0.5">{ACADEMY_ADDRESS.name}</span>
        <span className="block text-[#666666] text-sm">{ACADEMY_ADDRESS.street}</span>
        <span className="block text-[#666666] text-sm">{ACADEMY_ADDRESS.city}</span>
        <span className="inline-block text-[#CC0000] text-xs font-medium mt-1.5 uppercase tracking-wider">
          Open in Maps →
        </span>
      </a>
    </div>
  )
}
