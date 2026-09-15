import { p, type Post } from '../types'

export const post: Post = {
  slug: 'bjj-world-league-double-gold',
  title: 'Multiple Golds for Fight Factory at the BJJ World League',
  date: '2026-06-17',
  category: 'competition',
  excerpt: 'Big weekend for the Fight Factory crew. Grayson and Jack both came home from the BJJ World League tournament with double gold, two championship brackets apiece.',
  cover: {
    src: '/site/blog/bjj-world-league-double-gold.webp',
    alt: 'Grayson and Jack with their medals at the BJJ World League',
    w: 569,
    h: 427,
  },
  body: [
    p('Big weekend for the Fight Factory crew. Grayson and Jack both came home from the BJJ World League tournament with double gold, two championship brackets apiece.'),
    p('They got it done by finishing matches, too. Grayson racked up four submissions on the day and Jack added three, seven between them. Congrats to both of these guys. Proud of the work.'),
  ],
}
