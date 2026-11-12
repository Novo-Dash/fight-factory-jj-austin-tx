import { gsap } from "gsap";

/* ---------------------------------------------------------------------------
   Black Friday: o efeito dos botões que levam ao formulário, o mesmo da
   roupagem de Halloween (src/halloween/ctafx.ts no branch halloween-2026,
   portado da Ares). Duas abas em pílula saem de trás do botão: a etiqueta da
   Black Friday em cima, à esquerda, e a oferta embaixo, à direita. A máscara
   tem a forma exata do botão; o botão só recebe pointerenter/leave e o clique
   segue igual. O botão do header fica de fora. Porte da Alliance Carmel
   Mountain (origin/main), pedido "estilo Carmel".

   Prévias sozinhas: no desktop, uma vez, no CTA do hero (o hover faz o resto).
   No celular, sem hover, em ciclo em todos os CTAs visíveis, e some enquanto a
   tela rola. Com prefers-reduced-motion, hover sem animar e sem prévia.
   --------------------------------------------------------------------------- */
type Cond = { motion?: boolean; small?: boolean; hover?: boolean };

/* folga da mascara ao redor do botao e quanto da aba fica enfiado atras dele */
/* PAD_X largo (era 40): a aba de baixo é mais comprida que botão estreito e
   era cortada pela máscara ("nrollment"). Tem que bater com o .bfx-mask do CSS. */
const PAD_X = 140;
const PAD_Y = 64;
/* tamanho da aba pelo botão (Felipe, 02/11: nos botões do time as abas eram
   maiores que o próprio botão): sm = só o ícone em cima e "$0 enrollment"
   embaixo; md = frase curta; lg = a frase inteira */
const sizeOf = (w: number, h: number) => (h < 44 || w < 190 ? "sm" : w < 250 ? "md" : "lg");
const PEEK_SHOW = 2000; /* quanto tempo a previa fica aberta */
const PEEK_GAP = 7000; /* pausa entre uma prévia e a próxima no celular (Felipe, 01/11: 0,9 s era demais) */

const isTrigger = (el: HTMLElement) => {
  if (el.closest(".nd") || el.closest(".bfx") || el.closest("header")) return false;
  /* sem abas: o botão da própria seção da oferta (Felipe, 01/11, na Carmel) */
  if (el.closest("#black-friday")) return false;
  /* Fight Factory: os botões de agendar são <button> do Button com openModal,
     marcados com data-book (texto com "trial" pegaria a pergunta do FAQ) */
  return el.matches("[data-book]");
};

export function mountCtaFx(root: HTMLElement, c: Cond) {
  const fx = root.querySelector<HTMLElement>("[data-bfx]");
  const top = fx?.querySelector<HTMLElement>("[data-bfx-top]");
  const bot = fx?.querySelector<HTMLElement>("[data-bfx-bot]");
  const mask = fx?.querySelector<HTMLElement>("[data-bfx-mask]");
  if (!fx || !top || !bot || !mask) return () => {};
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
    /* botao colado no topo: nao ha espaco em cima, a gaveta de cima se esconde
       e o icone entra na frase */
    fx.classList.toggle("bfx--low", r.top < 96);
    const size = sizeOf(r.width, r.height);
    fx.classList.toggle("bfx--sm", size === "sm");
    fx.classList.toggle("bfx--md", size === "md");
    /* a mascara so muda com o tamanho do botao; posicao muda todo quadro */
    const key = `${r.width}|${r.height}|${R}|${size}`;
    if (key === maskKey) return;
    maskKey = key;
    const tuck = size === "sm" ? 7 : 12;
    /* tudo e visivel, menos o retangulo arredondado do proprio botao */
    const W = r.width + 2 * PAD_X;
    const H = r.height + 2 * PAD_Y;
    const x = PAD_X; const y = PAD_Y; const w = r.width; const h = r.height;
    const hole = `M${x + R} ${y}H${x + w - R}A${R} ${R} 0 0 1 ${x + w} ${y + R}V${y + h - R}A${R} ${R} 0 0 1 ${x + w - R} ${y + h}H${x + R}A${R} ${R} 0 0 1 ${x} ${y + h - R}V${y + R}A${R} ${R} 0 0 1 ${x + R} ${y}Z`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'><path fill='#000' fill-rule='evenodd' d='M0 0H${W}V${H}H0Z${hole}'/></svg>`;
    const url = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    mask.style.setProperty("-webkit-mask-image", url);
    mask.style.maskImage = url;
    /* abas deslocadas para os lados, comecando onde a curva do botao termina */
    top.style.left = `${PAD_X + Math.max(6, R - 6)}px`;
    top.style.top = `${PAD_Y + tuck - top.offsetHeight}px`;
    bot.style.right = `${PAD_X + Math.max(6, R - 6)}px`;
    bot.style.top = `${PAD_Y + h - tuck}px`;
  };
  const follow = () => { if (cur) fit(); };
  gsap.ticker.add(follow);
  /* celular: a camada fixa nao acompanha o botao durante a rolagem por inercia;
     rolou, a gaveta se recolhe na hora e o ciclo so volta quando a rolagem para */
  let scrolling = 0;
  const onScroll = () => {
    if (c.hover) return;
    if (cur) { tl.pause(0); gsap.set(fx, { opacity: 0 }); cur = null; }
    window.clearTimeout(scrolling);
    scrolling = window.setTimeout(() => { scrolling = 0; }, 160);
  };
  const show = (el: HTMLElement) => { cur = el; fit(); tl.play(); };
  const hide = () => { tl.reverse(); };
  const press = () => gsap.to(fx, { scale: 0.96, duration: 0.14 * k, transformOrigin: "50% 50%" });
  const release = () => gsap.to(fx, { scale: 1, duration: 0.32 * k, ease: "back.out(2)" });

  const ctas = Array.from(document.querySelectorAll<HTMLElement>("[data-book]")).filter(isTrigger);
  const onEnter = (e: PointerEvent) => { hovering = true; show(e.currentTarget as HTMLElement); };
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

  /* previas: desktop = so o CTA do hero, uma vez; celular = ciclo continuo,
     um CTA visivel por vez, alternando entre eles. Sem movimento, nenhuma. */
  let io: IntersectionObserver | null = null;
  let wait = 0;
  let hold = 0;
  if (motion) {
    const hero = ctas.find((el) => el.getBoundingClientRect().width > 8);
    const inView = new Set<Element>();
    const uncovered = (el: Element) => {
      /* o bento do Why tem um "Book a trial class" com opacity 0 que so
         aparece no hover: sem hover (celular) ele e invisivel, nao ganha previa */
      if (parseFloat(getComputedStyle(el).opacity) < 0.1) return false;
      const r = el.getBoundingClientRect();
      /* botao inteiro abaixo da navbar fixa: so o centro livre deixava a aba
         sair embaixo de um CTA cortado pela barra */
      const hb = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      if (r.top < hb) return false;
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && (hit === el || el.contains(hit));
    };
    let last: HTMLElement | null = null;
    const loop = (ms: number) => { wait = window.setTimeout(tick, ms); };
    const tick = () => {
      const pool = (Array.from(inView) as HTMLElement[]).filter(uncovered);
      const el = pool.find((e) => e !== last) || pool[0];
      if (scrolling) { loop(200); return; }
      if (!el || hovering) { loop(500); return; }
      last = el;
      show(el);
      hold = window.setTimeout(() => {
        if (cur === el && !hovering) hide();
        if (!c.hover) loop(PEEK_GAP);
      }, PEEK_SHOW);
    };
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting && en.intersectionRatio >= 0.6) inView.add(en.target); else inView.delete(en.target); });
    }, { threshold: [0, 0.6] });
    (c.hover ? [hero] : ctas).forEach((el) => { if (el && io) io.observe(el); });
    loop(2500);
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
