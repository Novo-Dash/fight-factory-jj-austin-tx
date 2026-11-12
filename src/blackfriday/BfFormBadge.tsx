import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BF } from './offer'
import { TagGlyph } from './art'
import './blackfriday.css'

/* Selo da Black Friday no painel do formulário, o da Carmel. Lá ele foi montado
   dentro do Booking.tsx; aqui o kit (src/nd) não se edita, então o selo entra
   por fora: quando o form abre, um <div data-bf-badge> é inserido no painel
   antes do rodapé e o selo é um portal para dentro dele. Some com o painel. */
export default function BfFormBadge() {
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const sync = () => {
      const panel = document.querySelector<HTMLElement>('.nd-overlay .nd-panel')
      if (!panel) return setHost(null)
      if (panel.querySelector(':scope > [data-bf-badge]')) return
      const el = document.createElement('div')
      el.setAttribute('data-bf-badge', '')
      panel.insertBefore(el, panel.querySelector(':scope > .nd-panel-foot'))
      setHost(el)
    }
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      mo.disconnect()
      document.querySelectorAll('[data-bf-badge]').forEach((e) => e.remove())
    }
  }, [])

  if (!host) return null
  return createPortal(
    <div className="bf-form-badge" role="note" aria-label="Black Friday offer">
      <p className="bf-form-badge-tape bf-belt">
        <span>
          <TagGlyph />
          {BF.tag}
        </span>
        <i className="bf-rank" aria-hidden="true" />
      </p>
      <p className="bf-form-badge-offer">{BF.badge.offer}</p>
      <p className="bf-form-badge-when">{BF.badge.when}</p>
    </div>,
    host,
  )
}
