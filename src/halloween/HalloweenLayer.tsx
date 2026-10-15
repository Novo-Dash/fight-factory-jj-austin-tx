import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { gsap } from "gsap"

import { Bat, FxBat } from "./art"
import { HauntedBar, startBar } from "./bar"
import { startScene } from "./scene"
import { mountCtaFx, mountNav } from "./ctafx"
import "./halloween.css"

/* Paleta da camada: "halloween" (abobora e preto classicos + a marca da Fight
   Factory) ou "client" (so as cores do cliente). As cores moram em halloween.css. */
const PALETTE: "halloween" | "client" = "halloween"

/* ===========================================================================
   Halloween: camada tematica provisoria da Fight Factory (variacao C, navbar:
   varal de bandeirinhas e abobora pendurada, portada da Abdias).

   Sobreposta a pagina, inerte ao ponteiro e fora da arvore de acessibilidade.
   Nenhum componente, token ou estilo da pagina e tocado. Montada so na LP
   (App, rota "/"); /kids, /back-to-school e /book nao recebem. Para desligar,
   basta remover o <HalloweenLayer /> do App e esta pasta.

   Navbar: um morcego de asas abertas ao lado do botao do header, do lado
   esquerdo (a direita fica a teia de canto). Hover nos CTAs da pagina (nao no
   header): um morcego sai de tras do botao em cima e "Boo! Trick or treat" sai
   embaixo. O botao nao e tocado.
   =========================================================================== */

const viewport = () => ({ w: window.innerWidth, h: window.innerHeight })

/* vao livre nos cantos de cima do header (antes do logo, depois do botao):
   a teia de canto nunca encosta em logo, link ou botao */
const WEB_MAX = 64
const WEB_MIN = 28
function measureWebs() {
  const header = document.querySelector("header")
  if (!header) return { tl: 0, tr: 0 }
  const rs = Array.from(header.querySelectorAll("a, button, img"))
    .map((el) => el.getBoundingClientRect())
    /* o logo pode nao ter carregado (largura 0), mas a borda esquerda ja vale */
    .filter((r) => r.width > 0 || r.height > 0)
  if (!rs.length) return { tl: 0, tr: 0 }
  const fit = (free: number) => { const s = Math.min(WEB_MAX, Math.floor(free - 8)); return s >= WEB_MIN ? s : 0 }
  return {
    tl: fit(Math.min(...rs.map((r) => r.left))),
    tr: fit(window.innerWidth - Math.max(...rs.map((r) => r.right))),
  }
}

export default function HalloweenLayer() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [vp, setVp] = useState(() => (typeof window === "undefined" ? { w: 1440, h: 900 } : viewport()))
  const [webs, setWebs] = useState({ tl: 0, tr: 0 })

  useEffect(() => {
    let t = 0
    /* so a LARGURA remonta a camada: no celular a barra de endereco muda a altura
       a cada rolagem, e remontar replayava a entrada (tudo sumia e voltava) */
    const onResize = () => { window.clearTimeout(t); t = window.setTimeout(() => setVp((v) => (v.w === window.innerWidth ? v : viewport())), 120) }
    window.addEventListener("resize", onResize)
    return () => { window.clearTimeout(t); window.removeEventListener("resize", onResize) }
  }, [])

  useLayoutEffect(() => {
    const next = measureWebs()
    setWebs((w) => (w.tl === next.tl && w.tr === next.tr ? w : next))
  }, [vp])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    /* ---- 1. Sair da frente do formulario ----------------------------------
       O modal do kit (.nd-overlay) vive em z-index 1000, abaixo desta camada,
       e trava o scroll do body ao abrir. Enquanto ele estiver aberto, a
       decoracao se apaga. */
    let raf = 0
    const hw = root.querySelector<HTMLElement>(".hw")
    const sync = () => {
      raf = 0
      const blocked = document.querySelector(".nd-overlay") !== null || document.body.style.overflow === "hidden"
      root.dataset.hwHidden = String(blocked)
      if (hw) hw.dataset.hwHidden = String(blocked)
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(sync) }
    sync()
    const nodes = new MutationObserver(schedule)
    nodes.observe(document.body, { childList: true, subtree: true })
    const lock = new MutationObserver(schedule)
    lock.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] })
    /* a navbar da Fight Factory ja e fixa e nunca se esconde: nada a fazer nela */

    /* ---- 2. Movimento ----------------------------------------------------- */
    const mm = gsap.matchMedia()
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        small: "(max-width: 767px)",
        hover: "(hover: hover)",
      },
      (self) => {
        const c = self.conditions ?? {}
        /* hover no CTA e detalhe da navbar valem sempre; sem movimento, sem animar */
        const stopFx = mountCtaFx(root, c)
        const stopNav = mountNav(root, { anchor: "center", side: "left", width: c.small ? 26 : 34, height: c.small ? 13 : 17 })
        if (!c.motion) return () => { stopFx(); stopNav() }
        const stop = startScene(root, c)
        const stopBar = startBar(root)
        return () => { stop(); stopBar(); stopFx(); stopNav() }
      },
    )

    return () => {
      if (raf) cancelAnimationFrame(raf)
      nodes.disconnect()
      lock.disconnect()
      mm.revert()
    }
  }, [vp, webs])

  return (
    <div ref={rootRef} style={{ display: "contents" }} data-hw-hidden="false">
      <div className="hw" aria-hidden="true" data-hw-hidden="false" data-hw-palette={PALETTE}>
        <HauntedBar width={vp.w} webs={webs} />

        {/* detalhe da navbar: morcego ao lado do botao do header */}
        <Bat className="hw-nav hw-nav--bat" />

        {/* hover no CTA: duas abas em pilula atras do botao; a mascara tem a forma do botao */}
        <div className="hw-fx" data-hw-fx>
          <div className="hw-fx-mask" data-hw-fx-mask>
            <div className="hw-fx-tab hw-fx-tab--top" data-hw-fx-top><FxBat /></div>
            <div className="hw-fx-tab hw-fx-tab--bot" data-hw-fx-bot><FxBat /><span>Boo! Trick or treat</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
