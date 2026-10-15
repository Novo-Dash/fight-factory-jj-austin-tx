import { gsap } from "gsap";

/* ---------------------------------------------------------------------------
   Motor da cena. Tudo e transform e opacity numa camada inerte ao ponteiro;
   nada da pagina e tocado. Quem chama ja garantiu
   prefers-reduced-motion: no-preference.
   - Entrada (~2s): blocos surgem, teias se tecem (stroke-dashoffset),
     morcegos chegam do canto, mumia e abobora sobem, o detalhe da navbar
     aparece por ultimo.
   - Vida ambiente, calma: teias balancam ±0.6deg, morcegos pairam e batem
     asa devagar, a mumia oscila.
   - 3 planos de profundidade (data-hw-plane = back | mid | front) com
     paralaxe curta de ponteiro e de rolagem.
   --------------------------------------------------------------------------- */
type Hooks = {
  onScroll?: (sy: number, dir: number, speed: number) => void;
  onMove?: (nx: number, ny: number) => void;
  entry?: (tl: gsap.core.Timeline) => void;
};
type Conds = { small?: boolean; hover?: boolean };

export function startScene(root: HTMLElement, c: Conds, page: Hooks = {}) {
  const q = gsap.utils.selector(root);
  const small = !!c.small;
  const hover = !!c.hover && !small;

  const blocks = q(".hw-block");
  const webs = q("[data-hw-web]");
  const webPaths = q("[data-hw-web] path");
  const bats = q("[data-hw-bat]");
  const risers = q("[data-hw-rise]");
  const rockers = q("[data-hw-rock]");
  const navs = q("[data-hw-nav]");
  const wingsL = q('[data-hw-wing="l"]');
  const wingsR = q('[data-hw-wing="r"]');

  /* ---- entrada ------------------------------------------------------------- */
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  /* so anima o que existe nesta largura (sem aviso "target not found" do GSAP) */
  if (blocks.length) tl.from(blocks, { opacity: 0, duration: 0.8, stagger: 0.08 }, 0.2);
  if (webPaths.length) tl.fromTo(webPaths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", stagger: { each: 0.05, from: "random" } }, 0.3);
  if (bats.length) tl.from(bats, { x: (_i: number, el: Element) => ((el as HTMLElement).dataset.hwFrom === "right" ? 70 : -70), y: -46, scale: 0.5, opacity: 0, duration: 1.1, ease: "power2.out", stagger: 0.12 }, 0.9);
  if (risers.length) tl.from(risers, { y: 26, opacity: 0, duration: 0.9, stagger: 0.15 }, 1.0);
  if (navs.length) tl.from(navs, { y: -10, opacity: 0, duration: 0.7 }, 1.3);
  if (page.entry) page.entry(tl);

  /* ---- vida ambiente ------------------------------------------------------- */
  webs.forEach((w, i) => gsap.fromTo(w, { "--hw-sway": "-0.6deg" }, { "--hw-sway": "0.6deg", duration: 5 + (i % 3), yoyo: true, repeat: -1, ease: "sine.inOut", delay: i * 0.4 }));
  bats.forEach((b, i) => gsap.to(b, { x: (i % 2 ? -1 : 1) * (8 + i * 3), y: -(6 + i * 2), duration: 7 + i * 1.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.3 }));
  wingsL.forEach((w, i) => gsap.to(w, { rotation: 16, svgOrigin: "44 26", duration: 0.9 + (i % 3) * 0.1, repeat: -1, yoyo: true, ease: "sine.inOut" }));
  wingsR.forEach((w, i) => gsap.to(w, { rotation: -16, svgOrigin: "56 26", duration: 0.9 + (i % 3) * 0.1, repeat: -1, yoyo: true, ease: "sine.inOut" }));
  rockers.forEach((r, i) => gsap.fromTo(r, { rotation: -1.5 }, { rotation: 1.5, transformOrigin: "50% 100%", duration: 3.6 + (i % 2) * 0.6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2 }));

  /* ---- profundidade: 3 planos, ponteiro + rolagem -------------------------- */
  const plane = (sel: string, mx: number, my: number, sy: number) => {
    const els = q(sel);
    if (!els.length) return null;
    return {
      x: gsap.quickTo(els, "x", { duration: 1.1, ease: "power2.out" }),
      y: gsap.quickTo(els, "y", { duration: 1.1, ease: "power2.out" }),
      mx, my, sy,
    };
  };
  const planes = [
    plane('[data-hw-plane="back"]', 2, 1, 0),
    plane('[data-hw-plane="mid"]', 4, 2, small ? -2 : -4),
    plane('[data-hw-plane="front"]', 7, 4, small ? -4 : -8),
  ].filter(Boolean) as { x: (v: number) => void; y: (v: number) => void; mx: number; my: number; sy: number }[];
  const st = { nx: 0, ny: 0, s: 0 };
  const apply = () => planes.forEach((p) => {
    p.x(hover ? st.nx * p.mx : 0);
    p.y((hover ? st.ny * p.my : 0) + st.s * p.sy);
  });

  let lastY = window.scrollY;
  let lastT = performance.now();
  const onScroll = () => {
    const y = window.scrollY;
    const now = performance.now();
    const dir = y > lastY ? 1 : y < lastY ? -1 : 0;
    const dt = Math.min(120, Math.max(16, now - lastT));
    const speed = Math.min(1, Math.abs(y - lastY) / dt / 2);
    st.s = Math.min(1, Math.max(0, y / 600));
    apply();
    if (page.onScroll) page.onScroll(y, dir, speed);
    lastY = y;
    lastT = now;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  let onMove: ((e: PointerEvent) => void) | null = null;
  if (hover) {
    onMove = (e: PointerEvent) => {
      st.nx = (e.clientX / window.innerWidth) * 2 - 1;
      st.ny = (e.clientY / window.innerHeight) * 2 - 1;
      apply();
      if (page.onMove) page.onMove(st.nx, st.ny);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
  }

  return () => {
    window.removeEventListener("scroll", onScroll);
    if (onMove) window.removeEventListener("pointermove", onMove);
  };
}
