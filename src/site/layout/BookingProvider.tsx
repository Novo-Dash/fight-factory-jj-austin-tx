import { useEffect, type ReactNode } from 'react'
import { ModalContext, useModalState } from '../hooks/useSiteModal'
import { SiteBookingModal } from './SiteBookingModal'

/**
 * Provides the open/closed context every CTA on the site consumes, and picks
 * up any `<a href="#book">` / `<a href="#start">` in the markup so a link in
 * body copy opens the modal without being wired one button at a time.
 */
export function BookingProvider({ children }: { children: ReactNode }) {
  const modal = useModalState()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href="#book"], a[href="#start"]',
      )
      if (!anchor) return
      e.preventDefault()
      modal.openModal()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [modal])

  return (
    <ModalContext.Provider value={modal}>
      {children}
      <SiteBookingModal isOpen={modal.isOpen} onClose={modal.closeModal} />
    </ModalContext.Provider>
  )
}
