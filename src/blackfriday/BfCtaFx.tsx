import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { BF } from './offer'
import { TagGlyph } from './art'
import { mountCtaFx } from './ctafx'
import './blackfriday.css'

/* Camada do efeito nos botões que levam ao formulário (Felipe, 01/11: "como no
   Halloween"). Sobreposta à página, inerte ao ponteiro e fora da árvore de
   acessibilidade; se apaga enquanto o formulário está aberto. */
export default function BfCtaFx() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    // o modal do kit trava o scroll do body ao abrir: enquanto isso, some
    let raf = 0
    const layer = root.querySelector<HTMLElement>('.bfx-layer')
    const sync = () => {
      raf = 0
      const blocked = document.querySelector('.nd-overlay') !== null || document.body.style.overflow === 'hidden'
      if (layer) layer.dataset.hidden = String(blocked)
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(sync) }
    sync()
    const nodes = new MutationObserver(schedule)
    nodes.observe(document.body, { childList: true, subtree: true })
    const lock = new MutationObserver(schedule)
    lock.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] })

    const mm = gsap.matchMedia()
    mm.add(
      { motion: '(prefers-reduced-motion: no-preference)', small: '(max-width: 767px)', hover: '(hover: hover)' },
      (self) => mountCtaFx(root, self.conditions ?? {}),
    )
    return () => {
      if (raf) cancelAnimationFrame(raf)
      nodes.disconnect()
      lock.disconnect()
      mm.revert()
    }
  }, [])

  return (
    <div ref={rootRef} style={{ display: 'contents' }}>
      <div className="bfx-layer" aria-hidden="true" data-hidden="false">
        <div className="bfx" data-bfx>
          <div className="bfx-mask" data-bfx-mask>
            <div className="bfx-tab bfx-tab--top" data-bfx-top><TagGlyph /><span>{BF.tag}</span></div>
            {/* a frase pelo tamanho do botão: a classe bfx--md/--sm vem do ctafx.ts */}
            <div className="bfx-tab bfx-tab--bot" data-bfx-bot>
              <TagGlyph />
              <span className="bfx-lg">{BF.badge.offer}</span>
              <span className="bfx-md">$0 enrollment + free kit</span>
              <span className="bfx-sm">$0 enrollment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
