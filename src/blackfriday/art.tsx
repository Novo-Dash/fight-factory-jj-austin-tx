/* Vetores da roupagem de Black Friday. A Fight Factory não tem foto do kit
   (o gi e a rash guard soltos), então as duas peças são desenho próprio.
   Kimono branco com faixa BRANCA (aluno novo; nunca faixa preta). */

/* Etiqueta de preço pequena: separador da faixa corrida e dos selos. */
export function TagGlyph() {
  return (
    <svg className="bf-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M2.5 11.6V3.5a1 1 0 0 1 1-1h8.1l9.9 9.9-9.1 9.1-9.9-9.9ZM7.6 5.6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
        fill="currentColor"
      />
    </svg>
  )
}

// o mesmo contorno do kimono da roupagem da Carmel (art.tsx de lá), aqui branco
const GI =
  'M176 40Q210 50 244 40L312 58Q352 150 380 284L330 314Q306 238 290 170L298 410Q210 419 122 410L130 170Q114 238 90 314L40 284Q68 150 108 58Z'

export function Gi({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 440" aria-hidden="true">
      <defs>
        <linearGradient id="bf-gi-white" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6e6e6" />
        </linearGradient>
      </defs>
      <ellipse cx="210" cy="424" rx="132" ry="12" fill="#000" opacity="0.35" />
      <path d={GI} fill="url(#bf-gi-white)" />
      {/* o V do peito */}
      <path d="M176 40Q210 50 244 40L210 132Z" fill="#cfcfcf" />
      {/* gola: a de baixo e a de cima, com pesponto */}
      <path d="M250 42L158 250" stroke="#ececec" strokeWidth="27" />
      <path d="M250 42L158 250" stroke="#000" strokeOpacity="0.16" strokeWidth="1.4" strokeDasharray="4 4" fill="none" />
      <path d="M170 42L262 250" stroke="#f6f6f6" strokeWidth="27" />
      <path d="M170 42L262 250" stroke="#000" strokeOpacity="0.18" strokeWidth="1.4" strokeDasharray="4 4" fill="none" />
      <path d="M262 276L240 410" stroke="#dcdcdc" strokeWidth="7" />
      {/* barras das mangas e da jaqueta */}
      <g fill="none" stroke="#000" strokeOpacity="0.14" strokeWidth="1.4" strokeDasharray="4 4">
        <path d="M372 270L324 296" />
        <path d="M48 270L96 296" />
        <path d="M126 398Q210 406 294 398" />
      </g>
      {/* vincos do tecido */}
      <g fill="none" stroke="#000" strokeOpacity="0.07" strokeWidth="2" strokeLinecap="round">
        <path d="M146 300Q150 350 144 396" />
        <path d="M276 300Q272 350 278 396" />
        <path d="M120 112Q128 180 132 220" />
        <path d="M300 112Q292 180 288 220" />
      </g>
      {/* faixa branca: volta, nó e as pontas com a barra preta de grau da faixa branca */}
      <path d="M129 252Q210 260 291 252L292 278Q210 286 128 278Z" fill="#fafafa" />
      <path d="M129 252Q210 260 291 252M128 278Q210 286 292 278" fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="2" />
      <path d="M198 276L214 278L190 352L174 347Z" fill="#fafafa" stroke="#000" strokeOpacity="0.12" strokeWidth="1.5" />
      <path d="M210 278L226 276L248 347L232 352Z" fill="#f0f0f0" stroke="#000" strokeOpacity="0.12" strokeWidth="1.5" />
      <path d="M181 326L196 331L190 352L174 347Z" fill="#111" />
      <path d="M236 331L251 326L248 347L232 352Z" fill="#111" />
      <rect x="195" y="246" width="30" height="36" rx="5" fill="#f4f4f4" stroke="#000" strokeOpacity="0.14" strokeWidth="1.5" />
      <path d={GI} fill="none" stroke="#000" strokeOpacity="0.18" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// rash guard de manga longa, de frente: preta com os painéis no vermelho da marca
const RASH =
  'M150 46Q210 74 270 46L330 66Q370 160 394 300L350 318Q330 232 312 164L308 404Q210 414 112 404L108 164Q90 232 70 318L26 300Q50 160 90 66Z'

export function RashGuard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 420 440" aria-hidden="true">
      <defs>
        <linearGradient id="bf-rash-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2a2a" />
          <stop offset="1" stopColor="#0c0c0c" />
        </linearGradient>
        <clipPath id="bf-rash-clip">
          <path d={RASH} />
        </clipPath>
      </defs>
      <ellipse cx="210" cy="424" rx="128" ry="11" fill="#000" opacity="0.22" />
      <path d={RASH} fill="url(#bf-rash-body)" />
      <g clipPath="url(#bf-rash-clip)" fill="var(--bf-red)">
        {/* painéis laterais e punhos */}
        <path d="M108 168L132 172L130 410L106 410Z" />
        <path d="M312 168L288 172L290 410L314 410Z" />
        <path d="M26 300L70 318L76 300L32 282Z" />
        <path d="M394 300L350 318L344 300L388 282Z" />
        {/* faixa do ombro ao punho */}
        <path d="M90 66L106 72Q74 170 52 292L38 288Q60 168 90 66Z" />
        <path d="M330 66L314 72Q346 170 368 292L382 288Q360 168 330 66Z" />
      </g>
      {/* gola careca e costuras */}
      <path d="M150 46Q210 92 270 46" fill="none" stroke="#3a3a3a" strokeWidth="9" />
      <g fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.4" strokeDasharray="4 4">
        <path d="M150 54Q210 98 270 54" />
        <path d="M118 396Q210 406 302 396" />
      </g>
      <g fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="2" strokeLinecap="round">
        <path d="M160 180Q170 280 160 390" />
        <path d="M260 180Q250 280 260 390" />
      </g>
      <path d={RASH} fill="none" stroke="#000" strokeOpacity="0.3" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
