/* Oferta de Black Friday desta LP (tarefa de 12/11/2026, campanha de 3/11 a
   2/12). É o único arquivo que muda de cliente para cliente; o resto da pasta
   é a roupagem da Alliance Carmel Mountain (pedido: "estilo Carmel"). Textos
   como vieram na tarefa; nada de travessão em texto que aparece na tela. */

// vagas da oferta: o time atualiza só `taken`. Com 0, a página diz só "Only 20 spots"
// Felipe, 13/11 (regra): vaga de BF nunca aparece zerada; sem número do cliente, 6 de 20 tomadas
const spots = { total: 20, taken: 6 }
const left = spots.total - spots.taken
const spotsLine = spots.taken ? `${left} ${left === 1 ? 'spot' : 'spots'} left` : `Only ${spots.total} spots`

// fim da oferta: quarta, 2/12, 23:59 no fuso da academia (Austin, CST)
const endsAt = '2026-12-02T23:59:59-06:00'

export const BF = {
  tag: 'Black Friday',
  // "Faixa do topo" da tarefa: abre a faixa corrida e é o eyebrow da seção
  eyebrow: 'Black Friday deal',
  title: '$0 Enrollment + Free Starter Kit',
  sub: 'From now until Dec 2, new students join with $0 enrollment and get a starter kit worth $220: gi and rash guard.',
  // os benefícios da tarefa viram as peças da seção, cada um uma vez:
  // "$0 enrollment (save $175)" no cartão, "Starter kit worth $220" no selo do kit, "Only 20 spots" na faixa do prazo
  enrollment: { value: '$0', label: 'enrollment', save: 'Save $175', was: '$175', row: 'Enrollment fee' },
  kit: { name: 'Starter kit', worth: '$220', gi: 'Gi', rash: 'Rash guard' },
  deadline: { endsAt, day: 'Wed', date: '2', month: 'Dec', lead: 'Black Friday ends Wednesday, Dec 2.' },
  // o selo do formulário: a oferta numa linha
  badge: { offer: '$0 enrollment + free starter kit', when: 'Until Dec 2' },
  ticker: ['Black Friday deal', '$0 enrollment + free starter kit', 'Until Dec 2', spotsLine],
  spots: { ...spots, left, line: spotsLine },
  cta: 'Claim your spot',
}
