import { p, type Post } from '../types'

export const post: Post = {
  slug: 'grappling-industries-luka',
  title: 'Dominant Performance at Grappling Industries',
  date: '2026-08-05',
  category: 'competition',
  excerpt: 'Congratulations to our athlete Luka on an incredible performance at Grappling Industries, going 4-0 and bringing home a hard-fought victory against a tough division.',
  cover: {
    src: '/site/results/grappling-industries.webp',
    alt: 'Luka on the podium at Grappling Industries',
    w: 1124,
    h: 627,
  },
  body: [
    p('Congratulations to our athlete Luka on an incredible performance at **Grappling Industries**, going **4-0** and bringing home a hard-fought victory against a tough division.'),
    p('The tournament tested his resilience from start to finish. After earning two dominant wins on points, he suffered a shoulder injury and found himself down 2-0 in his third match. With the match slipping away, he battled back in the final 45 seconds with a sweep to tie the score, ultimately earning the win by referee decision.'),
    p('In the finals, he left no doubt, submitting the same opponent in under a minute to cap off an impressive tournament run.'),
    p('What makes the performance even more impressive? He did it all while competing **15 pounds above his normal weight class**.'),
    p('A huge accomplishment and a testament to his toughness, skill, and ability to perform under pressure.'),
  ],
}
