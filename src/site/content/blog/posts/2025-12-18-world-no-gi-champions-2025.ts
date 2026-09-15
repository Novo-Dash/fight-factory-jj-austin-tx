import { h, list, p, type Post } from '../types'

export const post: Post = {
  slug: 'world-no-gi-champions-2025',
  title: '2025 World No-Gi Champions',
  date: '2025-12-18',
  category: 'competition',
  excerpt: 'Our academy delivered an outstanding performance at the World IBJJF Jiu-Jitsu No-Gi Championship 2025, highlighted by dominant finishes and a historic milestone for our team.',
  cover: {
    src: '/site/home/nogi-worlds.webp',
    alt: 'The team with their medals at the IBJJF No-Gi Worlds',
    w: 1500,
    h: 1080,
  },
  body: [
    h('Historic Wins at the World IBJJF Jiu-Jitsu No-Gi Championship 2025'),
    p('Our academy delivered an outstanding performance at the **World IBJJF Jiu-Jitsu No-Gi Championship 2025**, highlighted by dominant finishes and a historic milestone for our team.'),
    h('Janice Russell Becomes Professor Rodrigo’s First Adult Female World Champion'),
    p('Janice put together an exceptional run against elite competition, showcasing technical precision, composure, and finishing ability on the world stage.'),
    list([
      '**Opening match:** Janice secured a submission victory via a **reverse triangle** against the **#1 seed**, setting the tone for the division.',
      '**Final match:** She closed out the championship in emphatic fashion, winning by **straight footlock in just 30 seconds**.',
    ]),
    p('With this performance, **Janice becomes Professor Rodrigo’s first-ever Adult Female World Champion**, marking a historic achievement for both athlete and academy at the **World IBJJF Jiu-Jitsu No-Gi Championship 2025**. Her success reflects years of dedication, disciplined training, and trust in her jiu-jitsu under the highest level of competition.'),
    h('Howard Hughes Dominates in the Brown Belt Masters Division'),
    p('Howard also delivered a flawless performance in the **Brown Belt Masters division**, controlling every exchange from start to finish.'),
    list([
      '**Matches:** Won both matches decisively',
      '**Score:** 9–0 in both matches',
      '**Points allowed:** Zero',
    ]),
    p('Howard imposed his game throughout the tournament and did not allow a single point to be scored against him, demonstrating disciplined, pressure-based jiu-jitsu against experienced opponents on the world stage.'),
    h('Team Representation on the World Stage'),
    p('In addition to our podium finishes, several other team members stepped onto the mats and represented the academy at the **World IBJJF Jiu-Jitsu No-Gi Championship 2025**. Competing at this level requires commitment, preparation, and the willingness to test yourself against the best. Every match provides valuable experience that sharpens both skill and mindset, and we’re proud of everyone who accepted the challenge.'),
    h('Built Through Jiu-Jitsu'),
    p('Results like these are earned through consistent work on the mats, trust in the process, and commitment to growth. We’re proud of all our athletes for representing the academy with professionalism, grit, and humility.'),
    p('Congratulations to everyone who competed and represented our team at Worlds.'),
  ],
}
