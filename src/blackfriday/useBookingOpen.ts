import { useEffect, useState } from 'react'

/* true enquanto o formulário do kit (src/nd) está aberto. A roupagem é fixa e
   o modal mora em z-index 10000: sem isto a faixa ficaria por cima do funil.
   Dois sinais baratos: o .nd-overlay existe, ou o kit travou o body. Dois
   observers (filhos em toda a árvore + atributos só no body), nunca um só com
   subtree + attributes, que dispararia a cada tween. */
export function useBookingOpen() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      setOpen(document.querySelector('.nd-overlay') !== null || document.body.style.overflow === 'hidden')
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    const tree = new MutationObserver(queue)
    tree.observe(document.body, { childList: true, subtree: true })
    const body = new MutationObserver(queue)
    body.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] })
    check()
    return () => {
      tree.disconnect()
      body.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])
  return open
}
