import { useEffect, useState } from 'react'
import { BF } from './offer'
import { useBookingOpen } from './useBookingOpen'
import { TagGlyph } from './art'
import './blackfriday.css'

/* A faixa corrida presa embaixo da navbar fixa. Ela não toca a navbar: mede o
   rodapé do <header> fixo e se posiciona ali (ResizeObserver, porque a altura
   do header pode mudar com a largura). É a única faixa em loop da página. */
export default function BfTicker() {
  const [top, setTop] = useState<number | null>(null)
  const hidden = useBookingOpen()

  useEffect(() => {
    const header = document.querySelector('header')
    // a altura, não o bottom: a navbar da Carmel entra deslizando de cima e o
    // bottom medido no meio da entrada deixava a faixa por baixo dela
    const measure = () => setTop(header ? Math.round(header.getBoundingClientRect().height) : 0)
    // o ResizeObserver já chama uma vez ao observar; sem header, mede no próximo quadro
    if (!header) {
      const raf = requestAnimationFrame(measure)
      return () => cancelAnimationFrame(raf)
    }
    const ro = new ResizeObserver(measure)
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  // a frase toda repetida até passar de 2 telas largas: o loop anda -50% e emenda
  const group = Array.from({ length: 4 }, () => BF.ticker).flat()

  return (
    <div
      className="bf-ticker"
      style={{ top: top ?? 0 }}
      data-ready={top !== null || undefined}
      data-hidden={hidden || undefined}
      aria-hidden="true"
    >
      {/* a faixa leva à oferta: no celular a navbar não tem espaço para o botão */}
      <a className="bf-ticker-link" href="#black-friday" tabIndex={-1}>
      <div className="bf-ticker-band bf-belt">
        <div className="bf-ticker-track">
          {[0, 1].map((half) => (
            <div className="bf-ticker-group" key={half}>
              {group.map((t, i) => (
                <span className="bf-ticker-item" key={i}>
                  <TagGlyph />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      </a>
    </div>
  )
}
