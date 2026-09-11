import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { BookingForm } from './BookingForm'
import { trackViewContent } from './analytics'
import { ACADEMY_ADDRESS } from './schedule'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  kidsMode?: boolean
}

const BRAND_BULLETS = ['No commitment, ever', 'No experience required', 'Clean uniform provided']

export function BookingModal({ isOpen, onClose, kidsMode }: BookingModalProps) {
  // Esc fecha + trava o scroll do body enquanto aberto.
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  // ViewContent (Meta) + view_content (GA4) ao abrir o modal.
  useEffect(() => {
    if (isOpen) trackViewContent()
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Book your free trial class"
        className="relative w-full max-w-[920px] max-h-[90vh] flex flex-col md:flex-row rounded-2xl overflow-hidden border border-[#D8D8D8]"
        style={{ background: '#FFFFFF', borderTop: '3px solid #CC0000' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-[#999999] hover:text-[#0A0A0A] md:text-white/70 md:hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Coluna esquerda — painel de marca (estático, decorativo). Só no desktop. */}
        <aside
          className="hidden md:flex md:w-[360px] shrink-0 flex-col justify-between p-8 relative overflow-hidden"
          style={{ background: '#0A0A0A' }}
        >
          {/* Glow + grid hairline na paleta da marca */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(70% 50% at 30% 0%, rgba(204,0,0,0.28) 0%, rgba(204,0,0,0) 70%)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(80% 60% at 30% 30%, #000 0%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(80% 60% at 30% 30%, #000 0%, transparent 80%)',
            }}
          />

          <div className="relative z-10">
            <img
              src="/images/FONTE.webp"
              alt="Fight Factory Jiu-Jitsu"
              className="h-11 w-auto object-contain mb-8"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <h2
              className="text-white mb-3"
              style={{ fontFamily: 'Anton, sans-serif', fontSize: '2rem', lineHeight: 1.05, letterSpacing: '0.01em', textTransform: 'uppercase' }}
            >
              Your First Class<br />Is On Us
            </h2>
            <p className="text-white/60 text-sm mb-6" style={{ lineHeight: 1.6 }}>
              Book a free trial at Austin's premier BJJ academy. No pressure, just a great first class.
            </p>
            <ul className="space-y-2.5">
              {BRAND_BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-white/85 text-sm">
                  <span className="w-4 h-4 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l2.5 2.5L10 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 mt-8">
            <div className="text-white/85 text-sm font-semibold mb-0.5">250+ students · 5.0 ★ Google</div>
            <div className="text-white/45 text-xs mb-4" style={{ lineHeight: 1.5 }}>
              {ACADEMY_ADDRESS.street} · {ACADEMY_ADDRESS.city}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000] animate-pulse" />
              <span
                className="text-white/40 text-[0.65rem] uppercase tracking-[0.18em]"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
              >
                Fight Factory · Austin, TX
              </span>
            </div>
          </div>
        </aside>

        {/* Coluna direita — formulário compartilhado. Rola internamente se exceder. */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {/* Header de marca compacto — só mobile (não reintroduz scroll). */}
          <div className="md:hidden flex items-center gap-3 px-8 pt-7" >
            <img
              src="/images/FONTE.webp"
              alt="Fight Factory Jiu-Jitsu"
              className="h-9 w-auto object-contain"
              style={{ filter: 'brightness(0)' }}
            />
          </div>
          <BookingForm onDone={onClose} kidsMode={kidsMode} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
