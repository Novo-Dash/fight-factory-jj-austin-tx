import { gsap } from "gsap";

/* ---------------------------------------------------------------------------
   Efeito tematico no CTA, sem tocar no botao: a camada desenha duas abas em
   pilula que saem de tras do botao (um vetor de Halloween em cima, a
   esquerda; uma frase embaixo, a direita), como adesivos. O que esconde a
   parte "atras do botao" e uma MASCARA com a forma exata do botao (raio
   computado), nao um recorte reto: com botao arredondado, o recorte reto
   cortava a aba numa linha onde o botao nem existe e parecia bug (print do
   gestor em 09/10/2026, "nao esta bem encaixado"; Lucas: "sem aqueles
   cortes, porque os botoes sao arredondados"). Vale para o CTA do hero e os CTAs
   pelo corpo da pagina; o botao do header fica de fora (pedido do Lucas,
   09/10/2026). O botao so recebe pointerenter/leave; o clique segue igual.

   O efeito tambem da previas sozinho. No desktop, uma vez, no CTA do hero
   (o hover faz o resto). No celular, onde nao ha hover, roda em ciclo em
   TODOS os CTAs (gestor, 13/10/2026): a cada ~3s abre num CTA visivel,
   alternando entre os que estao na tela, e some enquanto a tela rola.
   Com prefers-reduced-motion, hover sem animar e sem previa.

   E o detalhe da navbar: um motivo ancorado ao lado do botao do header, no
   lado com mais folga, sem encostar em logo, link ou CTA.
   --------------------------------------------------------------------------- */
/* folga da mascara ao redor do botao e quanto da aba fica enfiado atras dele */
const PAD_X = 40;
const PAD_Y = 64;
const TUCK = 12;
const TAB_TOP_H = 44;
type Conds = { motion?: boolean; small?: boolean; hover?: boolean };
type NavOpts = { anchor: "top" | "bottom" | "center"; width: number; height: number; side?: "left" | "right" };

const PEEK_SHOW = 2000; /* quanto tempo a previa fica aberta */
const PEEK_GAP = 900; /* pausa entre uma previa e a proxima no celular */

const isTrigger = (el: Element) => {
  if (el.closest(".nd") || el.closest(".hw") || el.closest("header")) return false;
  /* Fight Factory: as perguntas do FAQ sao botoes com "trial" no texto; acordeao nao e CTA */
  if (el.hasAttribute("aria-expanded")) return false;
  if (el.matches('a[href="#book"], a[href="#start"]')) return true;
  return el.tagName === "BUTTON" && /book|trial/i.test(el.textContent || "");
};

export function mountCtaFx(root: HTMLElement, c: Conds) {
  const fx = root.querySelector<HTMLElement>("[data-hw-fx]");
  if (!fx) return () => {};
  const top = fx.querySelector<HTMLElement>("[data-hw-fx-top]")!;
  const bot = fx.querySelector<HTMLElement>("[data-hw-fx-bot]")!;
  const mask = fx.querySelector<HTMLElement>("[data-hw-fx-mask]")!;
  const motion = c.motion !== false;
  const k = motion ? 1 : 0; /* sem movimento: aparece e some sem animar */
  const tl = gsap.timeline({ paused: true, defaults: { duration: 0.4 * k, ease: "back.out(2.2)" } })
    .to(fx, { opacity: 1, duration: 0.12 * k, ease: "none" }, 0)
    .fromTo(top, { yPercent: 80, opacity: 0, filter: "blur(2px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)" }, 0)
    .fromTo(bot, { yPercent: -80, opacity: 0, filter: "blur(2px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)" }, 0.05 * k);

  let cur: HTMLElement | null = null;
  let hovering = false;
  let maskKey = "";
  const fit = () => {
    if (!cur) return;
    const r = cur.getBoundingClientRect();
    const R = Math.min(parseFloat(getComputedStyle(cur).borderTopLeftRadius) || 14, r.height / 2, r.width / 2);
    fx.style.left = `${r.left}px`;
    fx.style.top = `${r.top}px`;
    fx.style.width = `${r.width}px`;
    fx.style.height = `${r.height}px`;
    fx.classList.toggle("hw-fx--low", r.top < 96);
    /* a mascara so muda com o tamanho do botao; posicao muda todo quadro */
    const key = `${r.width}|${r.height}|${R}`;
    if (key === maskKey) return;
    maskKey = key;
    /* a mascara tem a forma do botao: tudo e visivel, menos o retangulo
       arredondado do proprio botao (a aba "esta atras" dele) */
    const W = r.width + 2 * PAD_X;
    const H = r.height + 2 * PAD_Y;
    const x = PAD_X; const y = PAD_Y; const w = r.width; const h = r.height;
    const hole = `M${x + R} ${y}H${x + w - R}A${R} ${R} 0 0 1 ${x + w} ${y + R}V${y + h - R}A${R} ${R} 0 0 1 ${x + w - R} ${y + h}H${x + R}A${R} ${R} 0 0 1 ${x} ${y + h - R}V${y + R}A${R} ${R} 0 0 1 ${x + R} ${y}Z`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'><path fill='#000' fill-rule='evenodd' d='M0 0H${W}V${H}H0Z${hole}'/></svg>`;
    const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    mask.style.webkitMaskImage = url;
    mask.style.maskImage = url;
    /* abas deslocadas para os lados, comecando onde a curva do botao termina */
    top.style.left = `${PAD_X + Math.max(6, R - 6)}px`;
    top.style.top = `${PAD_Y + TUCK - TAB_TOP_H}px`;
    bot.style.right = `${PAD_X + Math.max(6, R - 6)}px`;
    bot.style.top = `${PAD_Y + h - TUCK}px`;
    /* botao colado no topo: nao ha espaco em cima, a gaveta de cima se esconde
       e o icone entra na frase */
  };
  const follow = () => { if (cur) fit(); };
  gsap.ticker.add(follow);
  const ctas = Array.from(document.querySelectorAll<HTMLElement>('a[href="#book"], a[href="#start"], button')).filter(isTrigger);
  /* celular: a camada fixa nao acompanha o botao durante a rolagem por inercia
     (a gaveta ficava descolada, "buga ao rolar"); entao rolou, a gaveta se
     recolhe na hora e o ciclo so volta quando a rolagem para */
  let scrolling = 0;
  const onScroll = (e: Event) => {
    /* Fight Factory: um trilho da pagina rola sozinho o tempo todo; so conta a
       rolagem do documento ou de um container que tenha CTA dentro */
    const t = e.target;
    if (t instanceof Element && !ctas.some((el) => t.contains(el))) return;
    if (!c.hover) {
      if (cur) { tl.pause(0); gsap.set(fx, { opacity: 0 }); cur = null; }
      window.clearTimeout(scrolling);
      scrolling = window.setTimeout(() => { scrolling = 0; }, 160);
      return;
    }
  };
  const show = (el: HTMLElement) => { cur = el; fit(); tl.play(); };
  const hide = () => { tl.reverse(); };
  const press = () => gsap.to(fx, { scale: 0.96, duration: 0.14 * k, transformOrigin: "50% 50%" });
  const release = () => gsap.to(fx, { scale: 1, duration: 0.32 * k, ease: "back.out(2)" });

  const onEnter = (e: Event) => { hovering = true; show(e.currentTarget as HTMLElement); };
  const onLeave = () => { hovering = false; hide(); };
  if (c.hover) {
    ctas.forEach((el) => {
      el.addEventListener("pointerenter", onEnter, { passive: true });
      el.addEventListener("pointerleave", onLeave, { passive: true });
      el.addEventListener("pointerdown", press, { passive: true });
      el.addEventListener("pointerup", release, { passive: true });
      el.addEventListener("pointercancel", release, { passive: true });
    });
  }
  /* capture: tambem rolagem dentro de qualquer container */
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });

  /* previas: desktop = so o CTA do hero, uma vez (o hover faz o resto);
     celular = ciclo continuo, um CTA visivel por vez, alternando entre eles
     (pedido de 13/10/2026: "aumentar a frequencia no mobile, em todos os
     botoes"). Sem movimento, nenhuma previa. */
  let io: IntersectionObserver | null = null;
  let wait = 0;
  let hold = 0;
  if (motion) {
    const hero = ctas.find((el) => el.getBoundingClientRect().width > 8);
    const inView = new Set<HTMLElement>();
    const uncovered = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && (hit === el || el.contains(hit));
    };
    let last: HTMLElement | null = null;
    const loop = (ms: number) => { wait = window.setTimeout(tick, ms); };
    function tick() {
      const pool = Array.from(inView).filter(uncovered);
      const el = pool.find((e) => e !== last) || pool[0];
      if (scrolling) { loop(200); return; }
      if (!el || hovering) { loop(500); return; }
      last = el;
      show(el);
      hold = window.setTimeout(() => {
        if (cur === el && !hovering) hide();
        if (!c.hover) loop(PEEK_GAP);
      }, PEEK_SHOW);
    }
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting && en.intersectionRatio >= 0.6) inView.add(en.target as HTMLElement); else inView.delete(en.target as HTMLElement); });
    }, { threshold: [0, 0.6] });
    (c.hover ? [hero] : ctas).forEach((el) => { if (el && io) io.observe(el); });
    loop(1700);
  }

  return () => {
    window.removeEventListener("scroll", onScroll, { capture: true });
    window.clearTimeout(wait);
    window.clearTimeout(scrolling);
    window.clearTimeout(hold);
    if (io) io.disconnect();
    ctas.forEach((el) => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", press);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointercancel", release);
    });
    gsap.ticker.remove(follow);
    tl.kill();
  };
}

/* Detalhe da navbar: ancora o motivo ao lado do botao do header (ou do
   hamburguer no celular), no lado com mais folga. */
export function mountNav(root: HTMLElement, opts: NavOpts) {
  const motif = root.querySelector<HTMLElement>("[data-hw-nav]");
  const header = document.querySelector("header");
  if (!motif || !header) return () => {};
  const place = () => {
    const hb = header.getBoundingClientRect().bottom;
    /* so o que esta na barra (o menu aberto fica abaixo dela) */
    const items = Array.from(header.querySelectorAll("a, button"))
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 8 && r.height > 8 && r.top >= 0 && r.top < hb);
    if (!items.length) { motif.style.opacity = "0"; return; }
    /* a ancora e o item mais a direita da barra: o CTA no desktop, o
       hamburguer (ou o logo) no celular */
    const cta = items.reduce((a, b) => (b.left > a.left ? b : a));
    const leftNeighbor = items.filter((r) => r !== cta && r.right <= cta.left + 1).reduce((m, r) => Math.max(m, r.right), 0);
    const rightNeighbor = items.filter((r) => r !== cta && r.left >= cta.right - 1).reduce((m, r) => Math.min(m, r.left), window.innerWidth);
    const gapL = cta.left - leftNeighbor;
    const gapR = rightNeighbor - cta.right;
    const need = opts.width + 20;
    let x: number;
    const left = gapL >= need ? cta.left - 10 - opts.width : null;
    const right = gapR >= need ? cta.right + 10 : null;
    /* side: lado preferido (a direita do botao e da teia de canto) */
    const pick = opts.side === "left" ? left ?? right : right ?? left;
    if (pick === null) { motif.style.opacity = "0"; return; }
    x = pick;
    const y = opts.anchor === "top" ? 2
      : opts.anchor === "center" ? cta.top + (cta.height - opts.height) / 2
      : Math.max(2, hb - opts.height - 2);
    motif.style.opacity = "";
    motif.style.left = `${Math.round(x)}px`;
    motif.style.top = `${Math.round(y)}px`;
  };
  place();
  let t = 0;
  const onResize = () => { window.clearTimeout(t); t = window.setTimeout(place, 80); };
  window.addEventListener("resize", onResize);
  const ro = new ResizeObserver(onResize);
  ro.observe(header);
  return () => { window.removeEventListener("resize", onResize); ro.disconnect(); window.clearTimeout(t); };
}
