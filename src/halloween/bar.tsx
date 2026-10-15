import { gsap } from "gsap"
import { cornerWeb } from "./web"
import { BatBody } from "./art"

/* ---------------------------------------------------------------------------
   Variacao C (navbar): varal de bandeirinhas e abobora pendurada, portada da
   Abdias (14/10/2026). Tudo vive numa faixa da altura do header, que e fixo:
   - varal que CEDE entre os pontos de apoio, cada bandeirinha acompanha a
     curva e varia de tamanho: abobora com cara, morcego, faixa preta com a
     ponteira e lisa;
   - abobora de desenho animado pendurada pelo cabo enrolado no fio;
   - morcego pousado no fio, aranha descendo, teias naturais nos cantos de
     cima (desktop, so no vao livre antes do logo e depois do botao).
   Cada bandeirinha tem tres niveis: o span balanca (vida), o meio guarda a
   inclinacao da curva e o svg leva a entrada, sem um tween sobrescrever o outro.
   Cor so por custom property (halloween.css).
   --------------------------------------------------------------------------- */
const v = (name: string) => `var(--hw-${name})`

function Flag({ kind, x, y, tilt, k }: { kind: number; x: number; y: number; tilt: number; k: number }) {
  const dark = kind === 1 || kind === 3
  return (
    <span className={`hw-flag${dark ? " hw-halo" : ""}`} style={{ left: `${x.toFixed(1)}px`, top: `calc(100% + ${y.toFixed(1)}px)`, width: "var(--hw-flag-w)" }} data-hw-flag>
      <span className="hw-flag-tilt" style={{ transform: `rotate(${tilt.toFixed(1)}deg) scale(${k})` }}>
        <svg viewBox="0 0 24 30" focusable="false">
          <path d="M1 0H23L12 27Z" style={{ fill: v(dark ? "ink" : "pumpkin"), stroke: v("ink"), strokeOpacity: 0.35 }} strokeWidth="0.8" strokeLinejoin="round" />
          {kind === 0 && <path style={{ fill: v("ink") }} d="M6 5l3-3 2 3zM18 5l-3-3-2 3zM12 7l-1.4 2h2.8zM6.5 11q5.5 5 11 0h-2l-1 1.6-1.3-1.6h-1.4l-1.3 1.6-1.3-1.6h-1.4l-1 1.6-1-1.6z" />}
          {kind === 1 && <path style={{ fill: v("pumpkin") }} d="M12 7c-1.5 0-2.2 1.6-2.3 3-2-2.3-5-2.7-7.2-1.4 1.6.6 2 2 1.4 3.6 1.9-.8 3.5-.3 4.1 1 1.4-.9 2.7-.8 4 .5 1.3-1.3 2.6-1.4 4-.5.6-1.3 2.2-1.8 4.1-1-.6-1.6-.2-3 1.4-3.6-2.2-1.3-5.2-.9-7.2 1.4-.1-1.4-.8-3-2.3-3z" />}
          {kind === 3 && <path style={{ fill: v("accent") }} d="M7.9 16.5h8.2l-1.6 3.6H9.5z" />}
          {kind === 3 && <path style={{ stroke: v("edge") }} d="M10.4 16.6l.9 3.4M12.4 16.6l.5 3.4" strokeWidth="0.7" />}
        </svg>
      </span>
    </span>
  )
}

/* abobora de desenho animado pendurada pelo cabo enrolado no fio */
function HangingPumpkin({ x, y }: { x: number; y: number }) {
  const line = { stroke: v("ink") }
  return (
    <span className="hw-hpk" style={{ left: `${x.toFixed(1)}px`, top: `calc(100% + ${y.toFixed(1)}px)` }} data-hw-hpk>
      <svg viewBox="0 0 60 72" fill="none" focusable="false">
        <defs>
          <radialGradient id="hw-hpk-l" cx="36%" cy="30%" r="80%"><stop offset="0%" style={{ stopColor: v("pumpkin-hi") }} /><stop offset="40%" style={{ stopColor: v("pumpkin") }} /><stop offset="100%" style={{ stopColor: v("pumpkin-lo") }} /></radialGradient>
          <radialGradient id="hw-hpk-s" cx="40%" cy="30%" r="80%"><stop offset="0%" style={{ stopColor: v("pumpkin-side") }} /><stop offset="60%" style={{ stopColor: v("pumpkin-mid") }} /><stop offset="100%" style={{ stopColor: v("pumpkin-deep") }} /></radialGradient>
          <linearGradient id="hw-hpk-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" style={{ stopColor: v("glow-hi") }} /><stop offset="100%" style={{ stopColor: v("glow") }} /></linearGradient>
        </defs>
        <path d="M30 24c-1-7 0-13 3-17 2.5-3 6.5-3 7.5-.5 1 2.6-2 4.6-4.4 3.2-2-1.2-1.5-4 .3-5" style={line} strokeWidth="5" strokeLinecap="round" />
        <path d="M30 24c-1-7 0-13 3-17 2.5-3 6.5-3 7.5-.5 1 2.6-2 4.6-4.4 3.2-2-1.2-1.5-4 .3-5" style={{ stroke: v("stem") }} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M32 16q-9-6-15 0 7 5 15 0z" style={{ fill: v("leaf"), stroke: v("ink") }} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M31.5 16q-6-1.5-12 0" style={{ stroke: v("ink"), strokeOpacity: 0.5 }} strokeWidth="0.8" />
        <ellipse cx="12" cy="47" rx="10" ry="17" fill="url(#hw-hpk-s)" style={line} strokeWidth="2" />
        <ellipse cx="48" cy="47" rx="10" ry="17" fill="url(#hw-hpk-s)" style={line} strokeWidth="2" />
        <ellipse cx="21" cy="46" rx="11" ry="19" fill="url(#hw-hpk-l)" style={line} strokeWidth="2" />
        <ellipse cx="39" cy="46" rx="11" ry="19" fill="url(#hw-hpk-l)" style={line} strokeWidth="2" />
        <ellipse cx="30" cy="45" rx="11.5" ry="20" fill="url(#hw-hpk-l)" style={line} strokeWidth="2" />
        <ellipse cx="22" cy="34" rx="5" ry="2.6" style={{ fill: v("edge"), fillOpacity: 0.22 }} transform="rotate(-25 22 34)" />
        <g fill="url(#hw-hpk-c)" style={line} strokeWidth="1.1" strokeLinejoin="round" data-hw-face>
          <path d="M13 38l10 3-3 5.5zM47 38l-10 3 3 5.5z" />
          <path d="M30 46l-2.6 4h5.2z" />
          <path d="M14 52q16 13 32 0l-3.4 1-2 4-3-3-3 4-3-4-3 4-2.6-4-3 3-2-4z" />
        </g>
        <path d="M12 35q5-4 10 0M48 35q-5-4-10 0" style={line} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

/* teia natural de canto (web.ts); a direita e o mesmo desenho espelhado no CSS */
function CornerWeb({ side, size }: { side: "tl" | "tr"; size: number }) {
  const w = cornerWeb({ size, seed: side === "tl" ? 3 : 8 })
  const paths = (light: boolean) => (
    <g style={{ stroke: v(light ? "edge" : "ink"), strokeOpacity: light ? 0.92 : 0.42 }}>
      <path d={w.spokes} strokeWidth={light ? 0.95 : 1.9} pathLength={1} />
      <path d={w.spiral} strokeWidth={light ? 0.75 : 1.6} pathLength={1} />
      <path d={w.loose} strokeWidth={light ? 0.7 : 1.5} pathLength={1} />
    </g>
  )
  return (
    <div className={`hw-webwrap hw-webwrap--${side}`} style={{ width: size, height: size }} data-hw-plane="back">
      <svg className={`hw-web hw-web--${side}`} viewBox={`0 0 ${size} ${size}`} fill="none" strokeLinecap="round" focusable="false" data-hw-web>
        {paths(false)}
        {paths(true)}
        {w.drops.map(([x, y, r], k) => <circle key={k} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(2)} style={{ fill: v("edge"), stroke: v("ink"), strokeOpacity: 0.35 }} strokeWidth="0.6" />)}
      </svg>
    </div>
  )
}

/* webs: tamanho de cada teia de canto, medido no vao livre do header (0 = sem teia) */
export function HauntedBar({ width, webs }: { width: number; webs: { tl: number; tr: number } }) {
  const small = width < 768
  /* varal em gomos: preso a cada P px e cedendo `sag` no meio de cada gomo */
  const P = small ? 130 : 240
  const sag = small ? 6 : 10
  const yAt = (x: number) => { const t = (((x % P) + P) % P) / P; return sag * 4 * t * (1 - t) }
  const tiltAt = (x: number) => { const t = (((x % P) + P) % P) / P; return (Math.atan((sag * 4 * (1 - 2 * t)) / P) * 180) / Math.PI }
  let string = ""
  for (let a = 0; a < width + P; a += P) string += `M${a} 0Q${a + P / 2} ${2 * sag} ${a + P} 0`
  const gap = small ? 22 : 30
  const hpkX = small ? width * 0.34 : 250
  /* vao no varal onde a abobora fica pendurada */
  const flags = []
  for (let x = gap / 2, i = 0; x < width; x += gap, i += 1) if (Math.abs(x - hpkX) > (small ? 22 : 30)) flags.push({ x, i })
  const perchX = small ? width * 0.5 : width * 0.22 /* celular: em 0,6 encostava no botao do header */
  const dangleX = small ? width * 0.88 : width * 0.76
  return (
    <div className="hw-bar" data-hw-bar>
      {!small && webs.tl > 0 && <CornerWeb side="tl" size={webs.tl} />}
      {!small && webs.tr > 0 && <CornerWeb side="tr" size={webs.tr} />}
      <svg className="hw-string" width={width} height={2 * sag + 4} viewBox={`0 0 ${width} ${2 * sag + 4}`} fill="none" focusable="false">
        <path d={string} style={{ stroke: v("string") }} strokeWidth="1.5" pathLength={1} data-hw-string />
      </svg>
      {flags.map((f) => <Flag key={f.i} kind={f.i % 4} x={f.x} y={yAt(f.x)} tilt={tiltAt(f.x)} k={[1, 0.88, 0.95, 0.84][f.i % 4]} />)}
      {/* morcego pousado no fio, asas abertas (as asas batem pelo motor da cena) */}
      <span className="hw-perch hw-halo" style={{ left: `${perchX.toFixed(1)}px`, top: `calc(100% + ${yAt(perchX).toFixed(1)}px)` }}>
        <svg viewBox="0 0 100 50" focusable="false"><BatBody feet /></svg>
      </span>
      <HangingPumpkin x={hpkX} y={yAt(hpkX)} />
      <span className="hw-dangle hw-halo" style={{ left: `${dangleX.toFixed(1)}px`, top: `calc(100% + ${yAt(dangleX).toFixed(1)}px)` }} data-hw-dangle>
        <svg viewBox="0 0 40 90" fill="none" focusable="false">
          <line x1="20" y1="0" x2="20" y2="56" style={{ stroke: v("string") }} strokeWidth="1.1" />
          <g style={{ stroke: v("ink") }} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 62L8 56 3 50M16 65L6 64 1 63M16 69L7 73 3 80M17 72L11 78 8 86M24 62l8-6 5-6M24 65l10-1 5-1M24 69l9 4 4 7M23 72l6 6 3 8" />
          </g>
          <ellipse cx="20" cy="71" rx="7" ry="9" style={{ fill: v("ink") }} /><ellipse cx="20" cy="60" rx="4.8" ry="4.4" style={{ fill: v("ink") }} />
          <circle cx="18.3" cy="59" r="0.9" style={{ fill: v("eye") }} /><circle cx="21.7" cy="59" r="0.9" style={{ fill: v("eye") }} />
        </svg>
      </span>
    </div>
  )
}

/* Entrada e vida da barra. Quem chama ja garantiu prefers-reduced-motion:
   no-preference; sem movimento, a barra fica no estado desenhado. */
export function startBar(root: HTMLElement) {
  const q = gsap.utils.selector(root)
  const flags = q("[data-hw-flag]") as HTMLElement[]
  const flagSvgs = q("[data-hw-flag] svg")
  const perch = q(".hw-perch")
  const hpk = q("[data-hw-hpk]")
  const dangle = q("[data-hw-dangle]")
  const ambient: gsap.core.Animation[] = []

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
  tl.addLabel("string", 0.15)
    .fromTo(q("[data-hw-string]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, "string")
    .addLabel("flags", "string+=0.3")
    .from(flagSvgs, { yPercent: -120, rotation: (i: number) => (i % 2 ? 22 : -22), transformOrigin: "50% 0%", opacity: 0, duration: 0.9, ease: "back.out(2.4)", stagger: { each: 0.022, from: "center" } }, "flags")
    .addLabel("cast", "flags+=0.55")
    .from(perch, { x: -50, y: -46, rotation: -30, scale: 0.6, opacity: 0, duration: 0.8, ease: "power2.out" }, "cast")
    .from(hpk, { y: -46, rotation: -40, opacity: 0, transformOrigin: "55% 4%", duration: 1.1, ease: "elastic.out(1, 0.45)" }, "cast+=0.25")
    .from(dangle, { y: -70, opacity: 0, duration: 1.1, ease: "bounce.out" }, "cast+=0.4")
    .add(() => {
      /* vida ambiente: onda nas bandeirinhas, abobora em pendulo com a cara tremeluzindo */
      ambient.push(gsap.fromTo(flags, { rotation: -3 }, { rotation: 3, duration: 1.7, ease: "sine.inOut", stagger: { each: 0.09, repeat: -1, yoyo: true } }))
      ambient.push(gsap.to(q("[data-hw-hpk] [data-hw-face]"), { opacity: "random(0.72, 1)", duration: "random(0.25, 0.7)", repeat: -1, repeatRefresh: true, ease: "none" }))
      ambient.push(gsap.fromTo(dangle, { y: -4 }, { y: 7, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 }))
      ambient.push(gsap.fromTo(hpk, { rotation: -7 }, { rotation: 7, transformOrigin: "55% 4%", duration: 1.9, ease: "sine.inOut", yoyo: true, repeat: -1 }))
    })

  return () => {
    tl.kill()
    ambient.forEach((a) => a.kill())
  }
}
