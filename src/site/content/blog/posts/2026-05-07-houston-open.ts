import { p, type Post } from '../types'

export const post: Post = {
  slug: 'houston-open',
  title: 'Fight Factory wins at the Houston Open',
  date: '2026-05-07',
  category: 'competition',
  excerpt: 'Fight Factory’s own Coach Sean went out there and put on a performance, finishing his first match with an under-one-minute submission, then coming back and securing the next match with a strong points victory to take 1st place.',
  cover: {
    src: '/site/blog/houston-open.webp',
    alt: 'Coach Sean competing at the Houston Open',
    w: 1985,
    h: 985,
  },
  body: [
    p('Fight Factory’s own Coach Sean went out there and put on a performance, finishing his first match with an under-one-minute submission, then coming back and securing the next match with a strong points victory to take 1st place.'),
    p('Ashley had a full weekend of competition across both gi and no-gi, and she delivered in both. In the gi division she fought through two matches to take gold on points. In no-gi, she opened with a rear naked choke submission in under a minute before running into the Pans gold medalist, twice. Silver on day two is nothing to hang your head about when the person across from you is that decorated.'),
    p('Khalil also battled hard and earned bronze, adding more hardware for the team.'),
    p('Proud of everyone who stepped on the mats, represented the gym, and put the work on display. Back to training Monday.'),
  ],
}
