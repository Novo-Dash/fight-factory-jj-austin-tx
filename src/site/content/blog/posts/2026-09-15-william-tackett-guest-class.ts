import { p, type Post } from '../types'

/**
 * ⚠️ RASCUNHO PARA O CLIENTE APROVAR (escrito em 15/09/2026).
 *
 * Este é o post de exemplo que o cliente pediu na call de 14/09: o William
 * mudou para Las Vegas e passa pela academia esta semana para dar aula. Serve
 * para o cliente ver como uma novidade fica no ar.
 *
 * O que é fato, dito pelo cliente: o William está de passagem por Austin nesta
 * semana e vai dar aula. O que NÃO foi dito, e por isso não está escrito aqui:
 * o dia, o horário e qual turma. Assim que o cliente confirmar, o jeito certo
 * de fechar é acrescentar um parágrafo com a data e a hora. Nada aqui afirma
 * um dia que ninguém confirmou.
 */
export const post: Post = {
  slug: 'william-tackett-guest-class',
  title: 'William Tackett is back on the mats this week',
  date: '2026-09-15',
  category: 'academy',
  excerpt:
    'The black belt who came up through this academy is in town, and he is teaching while he is here.',
  cover: {
    src: '/site/team/william-tackett.webp',
    alt: 'William Tackett in his black gi',
    w: 760,
    h: 1064,
    // Retrato num slot largo: sem isto o corte central pega o tronco e corta a cabeca.
    focus: '50% 12%',
  },
  body: [
    p(
      'William Tackett is back in Austin this week, and he is stepping on the mat to teach while he is here.',
    ),
    p(
      'William walked into Fight Factory as a blue belt in 2017 and took his black belt from Rodrigo Cabral in 2021, four years later. He now trains and competes out of Las Vegas, so a week with him on the mat is the kind of thing worth showing up for.',
    ),
    p(
      'Expect the session to look like the way he competes: a lot of detail on the entries, and no shortage of rounds afterwards. Every belt is welcome, and you do not need to be a competitor to get something out of it.',
    ),
    p(
      'Ask at the front desk for the exact class, or book a spot and we will point you to it.',
    ),
  ],
}
