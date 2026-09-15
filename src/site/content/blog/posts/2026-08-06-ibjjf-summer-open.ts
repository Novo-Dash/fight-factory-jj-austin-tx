import { p, type Post } from '../types'

export const post: Post = {
  slug: 'ibjjf-summer-open',
  title: 'Team Success at the IBJJF Summer Open',
  date: '2026-08-06',
  category: 'competition',
  excerpt: 'Our team had an outstanding showing at the IBJJF Summer Open, with Coach Sean Fitzpatrick and Kahlil both delivering impressive performances.',
  cover: {
    src: '/site/results/ibjjf-summer-open.webp',
    alt: 'The Fight Factory team with their medals at the IBJJF Summer Open',
    w: 1400,
    h: 720,
  },
  body: [
    p('Our team had an outstanding showing at the **IBJJF Summer Open**, with Coach **Sean Fitzpatrick** and **Kahlil** both delivering impressive performances.'),
    p('Coach Sean competed in both Gi and No-Gi, earning **gold in Gi** and a **silver medal in No-Gi**. His continued success reflects the dedication he brings to both his own training and to coaching our students every day.'),
    p('Kahlil also had an unforgettable tournament, capturing his **first IBJJF gold medal at purple belt**. Entering the seven-man lightweight division as the No. 2 seed, he faced three challenging opponents on his way to the title. In his opening match, he was swept early but quickly turned the tables with a triangle submission. His semifinal saw him score an early sweep and guard pass, allowing him to control the match for a points victory. The finals proved to be his toughest test, with multiple momentum swings and several close submission attempts. Kahlil stayed composed through the back-and-forth battle, defended the final scramble, and secured the championship with a hard-fought two-point victory.'),
    p('We’re incredibly proud of both Sean and Kahlil for representing our team with skill, determination, and perseverance. Congratulations on an outstanding weekend of competition, and we look forward to seeing what’s next for both athletes.'),
  ],
}
