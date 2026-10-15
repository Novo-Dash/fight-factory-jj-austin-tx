/* ---------------------------------------------------------------------------
   Teia NATURAL (14/10/2026: "nao gostei do formato das teias, mais elaborado,
   mais natural"). Gerada por semente, entao e sempre igual no mesmo lugar e
   diferente de uma teia para outra:
   - raios saindo de um centro deslocado, em angulos irregulares, ate pontos de
     ancoragem (a borda da navbar e, no canto, a lateral da tela);
   - espiral que CEDE com o peso entre um raio e outro (curva puxada para baixo);
   - fios partidos aqui e ali, pontas soltas penduradas e gotas de orvalho.
   --------------------------------------------------------------------------- */
type Pt = [number, number]
export type Web = { spokes: string; spiral: string; loose: string; drops: [number, number, number][]; hub: Pt }

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const f1 = (v: number) => v.toFixed(1)

/* hub: centro da teia; ends: pontas dos raios presos (em ordem angular);
   free: quantos raios curtos ficam soltos, caindo do centro */
export function orbWeb({ hub, ends, free = 2, rings = 6, seed = 1, longDrop = 0 }: { hub: Pt; ends: Pt[]; free?: number; rings?: number; seed?: number; longDrop?: number }): Web {
  const r = rng(seed)
  const J = (k: number) => (r() - 0.5) * 2 * k
  let spokes = ''
  let spiral = ''
  let loose = ''
  const drops: [number, number, number][] = []
  ends.forEach(([x, y]) => {
    /* raio levemente curvo, nunca uma regua */
    const mx = (hub[0] + x) / 2 + J(2)
    const my = (hub[1] + y) / 2 + J(2)
    spokes += `M${f1(hub[0])} ${f1(hub[1])}Q${f1(mx)} ${f1(my)} ${f1(x)} ${f1(y)}`
  })
  /* espiral: em cada volta, um ponto por raio (fracao com ruido) */
  for (let k = 1; k <= rings; k += 1) {
    const base = (k / (rings + 0.6)) ** 0.92
    const pts: Pt[] = ends.map(([x, y]) => {
      const t = Math.min(0.97, Math.max(0.08, base + J(0.035)))
      return [hub[0] + (x - hub[0]) * t, hub[1] + (y - hub[1]) * t]
    })
    for (let i = 0; i < pts.length - 1; i += 1) {
      if (r() < 0.1) {
        /* fio partido: sobra uma ponta solta caindo de um dos lados */
        const [px, py] = pts[i]
        const len = 4 + r() * 7
        loose += `M${f1(px)} ${f1(py)}q${f1(J(3))} ${f1(len * 0.6)} ${f1(J(4))} ${f1(len)}`
        continue
      }
      const [ax, ay] = pts[i]
      const [bx, by] = pts[i + 1]
      const seg = Math.hypot(bx - ax, by - ay)
      /* cede com o peso: o meio do fio desce */
      const mx = (ax + bx) / 2
      const my = (ay + by) / 2
      const pull = 0.2 + r() * 0.14
      const cx = mx + (hub[0] - mx) * pull + J(seg * 0.04)
      const cy = my + (hub[1] - my) * pull + seg * 0.05
      spiral += `M${f1(ax)} ${f1(ay)}Q${f1(cx)} ${f1(cy)} ${f1(bx)} ${f1(by)}`
      if (r() < 0.09) drops.push([ax, ay, 0.9 + r() * 0.8])
    }
  }
  /* raios soltos: fios curtos caindo do centro, com curva */
  for (let i = 0; i < free; i += 1) {
    const ang = Math.PI / 2 + J(i ? 0.9 : 0.25)
    const len = i ? 6 + r() * 10 : longDrop || 8 + r() * 14
    const ex = hub[0] + Math.cos(ang) * len
    const ey = hub[1] + Math.sin(ang) * len
    loose += `M${f1(hub[0])} ${f1(hub[1])}Q${f1(hub[0] + J(4))} ${f1((hub[1] + ey) / 2)} ${f1(ex)} ${f1(ey)}`
  }
  return { spokes, spiral, loose, drops, hub }
}

/* Teia de canto, desenhada para o canto superior ESQUERDO (o direito e o
   mesmo SVG espelhado no CSS): presa na lateral e na borda de cima, raios em
   ordem angular (de baixo na lateral, passando pelo canto, ate o topo). */
export function cornerWeb({ size, seed }: { size: number; seed: number }): Web {
  const r = rng(seed * 13 + 5)
  const s = size
  const hub: Pt = [s * (0.44 + r() * 0.08), s * (0.4 + r() * 0.08)]
  const ends: Pt[] = []
  const m = 3 + Math.floor(r() * 2)
  for (let i = m - 1; i >= 0; i -= 1) ends.push([0, s * ((i + 0.8) / m) * 0.95 + (r() - 0.5) * 5])
  ends.push([0, 0])
  const n = 4 + Math.floor(r() * 2)
  for (let i = 0; i < n; i += 1) ends.push([s * ((i + 0.8) / n) * 1.05 + (r() - 0.5) * 5, 0])
  return orbWeb({ hub, ends, free: 2, rings: 6, seed })
}
