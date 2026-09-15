import { p, type Post } from '../types'

export const post: Post = {
  slug: 'san-antonio-open',
  title: 'Fight Factory shows out at the San Antonio Open',
  date: '2026-05-13',
  category: 'competition',
  excerpt: 'Fight Factory had a strong showing at the San Antonio Open this past weekend, with athletes across both gi and no-gi divisions earning victories and representing the gym with distinction.',
  cover: {
    src: '/site/blog/san-antonio-open.webp',
    alt: 'Coach Sean on the podium at the San Antonio Open',
    w: 1080,
    h: 925,
  },
  body: [
    p('Fight Factory had a strong showing at the San Antonio Open this past weekend, with athletes across both gi and no-gi divisions earning victories and representing the gym with distinction.'),
    p('Leading the way was coach Sean, who put together a dominant performance to take the gold. Sean submitted his first opponent with a bow and arrow choke in round one, then returned in round two to finish with a head and arm choke. A composed, technically sound run from start to finish.'),
    p('Student Jack also picked up a win on the day, taking care of business in his match and adding to Fight Factory’s overall tally. In the no-gi division, student Joseph Lewis secured a victory of his own, continuing to build on his development on the mats.'),
    p('Solid performances across the board. The work being put in at the gym is showing up when it counts. Looking forward to what’s next.'),
  ],
}
