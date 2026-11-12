import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/ui/Button'
import { BF } from './offer'
import './blackfriday.css'

/* contagem regressiva até o fim da oferta, no relógio de quem visita */
function useCountdown(endsAt: string) {
  const end = new Date(endsAt).getTime()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const ms = Math.max(0, end - now)
  const s = Math.floor(ms / 1000)
  return {
    over: ms === 0,
    parts: [
      { n: Math.floor(s / 86400), label: 'Days' },
      { n: Math.floor((s % 86400) / 3600), label: 'Hours' },
      { n: Math.floor((s % 3600) / 60), label: 'Min' },
      { n: s % 60, label: 'Sec' },
    ],
  }
}

/* O bloco da oferta, logo depois do hero: a estrutura da seção da Carmel
   (título, frase, o kit em quadros com o selo do valor, o cartão da matrícula
   e, no fim, o prazo com a contagem e as vagas) na cara da Fight Factory.
   Cada benefício aparece uma vez. O único botão é o do formulário. */
export default function BfOffer() {
  const { over, parts } = useCountdown(BF.deadline.endsAt)
  const root = useRef<HTMLElement>(null)
  const [seen, setSeen] = useState(false)

  // entrada em cascata quando a seção aparece (com movimento reduzido, o CSS já nasce no fim)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true)
        io.disconnect()
      }
    }, { rootMargin: '0px 0px -80px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const { spots } = BF

  return (
    <section ref={root} id="black-friday" className="bf-offer" data-in={seen || undefined} aria-labelledby="bf-offer-title">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* cabeçalho no padrão das outras seções: traço + eyebrow vermelho e o H2 em Anton */}
        <div className="bf-head bf-rise">
          <div className="bf-eyebrow">
            <span aria-hidden="true" />
            {BF.eyebrow}
          </div>
          <h2 id="bf-offer-title" className="bf-title">{BF.title}</h2>
          <p className="bf-sub">{BF.sub}</p>
        </div>

        <div className="bf-grid">
          {/* o kit: as duas peças, cada uma no seu quadro, e o selo do valor na emenda */}
          <figure className="bf-kit bf-rise" style={{ '--i': 1 } as React.CSSProperties}>
            <div className="bf-kit-tile bf-kit-tile--dark">
              <img className="bf-kit-photo" src="/images/bf/gi-640.webp" srcSet="/images/bf/gi-640.webp 640w, /images/bf/gi-1000.webp 1000w" sizes="(min-width: 768px) 320px, 46vw" width="1000" height="1000" alt="White Fight Factory gi with a white belt" loading="lazy" decoding="async" />
              <span className="bf-kit-label">{BF.kit.gi}</span>
            </div>
            <div className="bf-kit-tile">
              <img className="bf-kit-photo" src="/images/bf/rash-guard-640.webp" srcSet="/images/bf/rash-guard-640.webp 640w, /images/bf/rash-guard-1000.webp 1000w" sizes="(min-width: 768px) 320px, 46vw" width="1000" height="1000" alt="Black Fight Factory rash guard with red side panels" loading="lazy" decoding="async" />
              <span className="bf-kit-label">{BF.kit.rash}</span>
            </div>
            <figcaption className="bf-kit-seal">
              <span className="bf-kit-seal-name">{BF.kit.name}</span>
              <span className="bf-kit-seal-sub">Worth</span>
              <strong>{BF.kit.worth}</strong>
            </figcaption>
          </figure>

          <div className="bf-side">
            <article className="bf-enroll bf-rise" style={{ '--i': 2 } as React.CSSProperties} aria-label={`${BF.enrollment.value} ${BF.enrollment.label}, ${BF.enrollment.save}`}>
              <p className="bf-tag bf-belt">
                <span>{BF.enrollment.save}</span>
                <i className="bf-rank" aria-hidden="true" />
              </p>
              <p className="bf-enroll-big" aria-hidden="true">
                <strong>{BF.enrollment.value}</strong>
                <span>{BF.enrollment.label}</span>
              </p>
            </article>
            <div className="bf-rise" style={{ '--i': 3 } as React.CSSProperties}>
              <Button size="lg" variant="red" openModal className="bf-cta">
                {BF.cta} →
              </Button>
            </div>
          </div>
        </div>

        {/* o prazo, no fim da seção: a data, a contagem e as vagas */}
        <div className="bf-deadline bf-rise" style={{ '--i': 4 } as React.CSSProperties}>
          <div className="bf-cal" aria-hidden="true">
            <span className="bf-cal-top">{BF.deadline.day}</span>
            <strong>{BF.deadline.date}</strong>
            <span className="bf-cal-month">{BF.deadline.month}</span>
          </div>
          <p className="bf-deadline-lead">{BF.deadline.lead}</p>
          <div className="bf-deadline-count">
            {over ? (
              <p className="bf-deadline-lead">Offer ended</p>
            ) : (
              <div className="bf-count" role="timer" aria-label={`Offer ends in ${parts[0].n} days and ${parts[1].n} hours`}>
                {parts.map((p) => (
                  <span key={p.label} className="bf-count-cell">
                    <strong>{String(p.n).padStart(2, '0')}</strong>
                    <span>{p.label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="bf-deadline-spots">
            {/* sem vaga fechada informada, só o total: nunca "0 claimed" */}
            <p className="bf-spots-line">
              {spots.taken ? (
                <>
                  <span><strong>{spots.left}</strong> of {spots.total} spots left</span>
                  <span className="bf-spots-claimed">{spots.taken} claimed</span>
                </>
              ) : (
                <strong>{spots.line}</strong>
              )}
            </p>
            <div
              className="bf-spots-bar bf-belt"
              role="img"
              aria-label={spots.taken ? `${spots.taken} of ${spots.total} spots claimed, ${spots.left} left` : spots.line}
              style={{ gridTemplateColumns: `repeat(${spots.total}, 1fr)` }}
            >
              {Array.from({ length: spots.total }, (_, i) => (
                <i key={i} className={i < spots.taken ? 'is-taken' : undefined} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
