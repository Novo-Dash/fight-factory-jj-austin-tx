import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { BookingForm } from '../../booking/BookingForm'
import { trackViewContent } from '../../booking/analytics'
import { ACADEMY, PROOF, SITE_SOURCE } from '../content/site'
import { Diamond } from '../components/ui'
import { MaskHeading } from '../components/MaskHeading'

/**
 * The site's shell around the SHARED booking form.
 *
 * `src/booking` itself is never forked: the form, the live GHL calendar, the
 * validation and both webhooks are the same module the landing page uses. Only
 * this frame and the lead label belong to the site. The form's own radii come
 * from `--radius-lg` / `--radius-2xl`, which this site redefines in its
 * `@theme`, so it arrives squared off to match everything around it.
 */
const PROMISES = ['No commitment, ever', 'No experience required', 'Clean uniform provided']

export function SiteBookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, onClose])

  // ViewContent (Meta) + view_content (GA4) on open, exactly once per opening.
  useEffect(() => {
    if (isOpen) trackViewContent()
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-5"
      style={{ background: 'rgba(11,12,13,0.88)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Book your free trial class"
        className="relative flex max-h-[92dvh] w-full max-w-[960px] flex-col overflow-hidden border-t-[3px] border-red bg-shell md:flex-row"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-ink md:text-white/60 md:hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        </button>

        {/* Brand column — desktop only, so the form never has to scroll twice. */}
        <aside className="plate relative hidden w-[340px] shrink-0 flex-col justify-between bg-ink p-8 md:flex">
          <div>
            <img
              src="/site/brand/wordmark-light.webp"
              alt={ACADEMY.name}
              width={400}
              height={56}
              className="h-7 w-auto"
            />
            <MaskHeading text={'Your first\nclass is\non us'} className="t-title mt-9 text-white" />
            <p className="t-body mt-4 text-white/55">
              Pick a programme, then a real time from the academy&rsquo;s calendar.
            </p>
            <ul className="mt-7 space-y-3">
              {PROMISES.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-white/80">
                  <Diamond className="text-red" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="record-row record-row-invert">
              <span className="nums t-sub text-white">
                {PROOF.studentsLabel} <span className="label ml-1 text-white/40">students</span>
              </span>
            </div>
            <p className="label-sm mt-4 text-white/35">
              {ACADEMY.street} · {ACADEMY.cityLine}
            </p>
          </div>
        </aside>

        {/* The shared form. Scrolls internally if it outgrows the frame. */}
        <div className="min-w-0 flex-1 overflow-y-auto bg-white">
          <div className="flex items-center gap-3 px-7 pt-7 md:hidden">
            <img
              src="/site/brand/wordmark-ink.webp"
              alt={ACADEMY.name}
              width={548}
              height={101}
              className="h-6 w-auto"
            />
          </div>
          <BookingForm source={SITE_SOURCE} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
