/* ---------------------------------------------------------------------------
   Pecas da cena, todas SVG inline. Vocabulario fechado com o gestor em
   09/10/2026: morcego de asas abertas, aranha com teia e abobora.
   Cor so por custom property (halloween.css), nunca fill="#..." solto.
   Os atributos data-hw-* sao os ganchos do movimento.
   --------------------------------------------------------------------------- */

const ink = { fill: "var(--hw-ink)" }
const eye = { fill: "var(--hw-eye)" }

/* corpo do morcego de asas abertas (navbar, aba do CTA e o pousado no fio) */
export function BatBody({ feet }: { feet?: boolean }) {
  return (
    <>
      <g data-hw-wing="l"><path style={ink} d="M44 20C34 6 18 4 3 12c7 3 9 9 6 16 8-4 15-2 18 5 6-4 12-4 17 2z" /></g>
      <g data-hw-wing="r"><path style={ink} d="M56 20c10-14 26-16 41-8-7 3-9 9-6 16-8-4-15-2-18 5-6-4-12-4-17 2z" /></g>
      <ellipse style={ink} cx="50" cy="27" rx="7" ry="11" /><circle style={ink} cx="50" cy="14" r="6.5" />
      <path style={ink} d="M45 10l-2-8 6 4zM55 10l2-8-6 4z" />
      <circle style={eye} cx="47.5" cy="13" r="1.1" /><circle style={eye} cx="52.5" cy="13" r="1.1" />
      {feet && <path d="M47 37l-1 5M53 37l1 5" style={{ stroke: "var(--hw-ink)" }} strokeWidth="1.6" strokeLinecap="round" />}
    </>
  )
}

/* Morcego de asas abertas ao lado do botao do header (posicionado pelo JS). */
export function Bat({ className }: { className?: string }) {
  return (
    <span className={`hw-bat hw-halo ${className ?? ""}`} data-hw-nav="">
      <svg viewBox="0 0 100 50" focusable="false"><BatBody /></svg>
    </span>
  )
}

/* Morcego chapado para as abas do efeito do CTA. */
export function FxBat() {
  return <svg viewBox="0 0 100 50" focusable="false"><BatBody /></svg>
}
