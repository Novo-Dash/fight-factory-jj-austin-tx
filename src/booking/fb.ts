// =============================================================================
// fb.ts — Identificadores de browser/clique do Meta para o espelho CAPI (§7.6.3)
// -----------------------------------------------------------------------------
//  - fbp: cookie _fbp (o snippet base do Pixel cria).
//  - fbc: cookie _fbc, com fallback first-party — o fbclid da URL de chegada
//    persistido no formato do _fbc. O cookie só existe quando o script do Pixel
//    carrega; o fallback cobre exatamente o caso do Pixel bloqueado.
// localStorage (não sessionStorage): a janela de atribuição do clique é longa.
// =============================================================================

const FBC_KEY = 'nd-fbc'

/** Chamar uma vez no boot do app (antes de a navegação SPA limpar a query). */
export function captureFbclid(): void {
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid')
    if (fbclid) localStorage.setItem(FBC_KEY, `fb.1.${Date.now()}.${fbclid}`)
  } catch {
    /* localStorage indisponível — segue sem fbc */
  }
}

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export function getFbp(): string | undefined {
  return readCookie('_fbp')
}

export function getFbc(): string | undefined {
  let stored: string | undefined
  try {
    stored = localStorage.getItem(FBC_KEY) ?? undefined
  } catch {
    stored = undefined
  }
  return readCookie('_fbc') ?? stored
}
