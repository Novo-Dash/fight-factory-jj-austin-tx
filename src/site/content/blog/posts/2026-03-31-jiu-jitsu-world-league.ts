import { p, type Post } from '../types'

export const post: Post = {
  slug: 'jiu-jitsu-world-league',
  title: 'Strong Performances at the Jiu Jitsu World League',
  date: '2026-03-31',
  category: 'competition',
  excerpt: 'It was an exciting and hard-fought competition weekend at the Jiu Jitsu World League, with several standout performances across multiple divisions.',
  cover: {
    src: '/site/blog/jiu-jitsu-world-league.webp',
    alt: 'Fight Factory athletes at the Jiu Jitsu World League',
    w: 1086,
    h: 556,
  },
  body: [
    p('It was an exciting and hard-fought competition weekend at the **Jiu Jitsu World League**, with several standout performances across multiple divisions.'),
    p('**Gianni**, competing at the **black belt level**, also claimed **first place**, further cementing his dominance on the mat. He secured **two submissions**, proving his high-level finishing ability against tough competition.'),
    p('**Melch Rodriguez** delivered an impressive showing in the Blue Belt Middleweight Master 1 division, taking home **first place**. He demonstrated both strategy and skill throughout his matches, securing his first victory by points and finishing his second match with a clean **omoplata submission**, showcasing his well-rounded game.'),
    p('In the no-gi divisions, **Nikita** competed in both blue and purple belt brackets, ultimately placing **fourth**, gaining valuable experience against a challenging field.'),
    p('**Johnny Bui** also stepped onto the mats in the blue and purple no-gi divisions, representing with determination and grit throughout his matches.'),
    p('Overall, it was a weekend filled with strong performances, technical execution, and continued growth for everyone involved. Each athlete showed heart and dedication, setting the tone for even bigger accomplishments ahead.'),
  ],
}
