import { h, list, p, type Post } from '../types'

export const post: Post = {
  slug: 'how-long-to-get-good',
  title: 'How Long Does It Take to Get Good at Jiu-Jitsu?',
  date: '2025-12-08',
  category: 'guide',
  excerpt: 'Short answer: you start feeling comfortable around 3–6 months if you train consistently.',
  cover: {
    src: '/site/blog/how-long-to-get-good.webp',
    alt: 'Students applauding a belt promotion at the end of class',
    w: 2048,
    h: 1280,
  },
  body: [
    h('How Long Does It Take to Get Good at BJ'),
    p('Short answer: you start feeling comfortable around 3–6 months if you train consistently. Blue belt varies, but for most people it’s about 1.5–3 years.'),
    h('Stages Most Beginners Go Through'),
    p('Month 1: survival mode Months 2–3: patterns start clicking Months 4–6: you recognize positions Year 1: you can roll with purpose Blue belt: you have a dependable game'),
    h('What Speeds Up Progress'),
    list([
      '3x/week training',
      'Asking questions',
      'Rolling with higher belts',
      'Sleep + recovery',
    ]),
    p('CTA:'),
    p('If you want a clear path from beginner to confident grappler, our fundamentals program in Austin is built for that.'),
    p('Try Fight Factory free for a week.'),
  ],
}
