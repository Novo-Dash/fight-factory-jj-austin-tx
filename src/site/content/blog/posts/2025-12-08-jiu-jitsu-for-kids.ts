import { h, list, p, type Post } from '../types'

export const post: Post = {
  slug: 'jiu-jitsu-for-kids',
  title: 'Jiu-Jitsu for Kids: What Parents Should Know',
  date: '2025-12-08',
  category: 'guide',
  excerpt: 'Parents usually start kids in BJJ for confidence or self-defense.',
  cover: {
    src: '/site/blog/jiu-jitsu-for-kids.webp',
    alt: 'The kids class lined up on the mat at the academy',
    w: 1335,
    h: 750,
  },
  body: [
    h('Jiu-Jitsu for Kids: More Than a Sport'),
    p('Parents usually start kids in BJJ for confidence or self-defense. They stay because of the life skills.'),
    h('Top Benefits for Children'),
    list([
      'Confidence from measurable progress',
      'Discipline through structure',
      'Respect and teamwork',
      'Anti-bullying skills grounded in control',
      'Fitness without boredom',
    ]),
    h('What a Good Kids Class Looks Like'),
    list([
      'Games + technique',
      'Clear behavior expectations',
      'Coaches who manage safety and attention',
      'Positive reinforcement',
    ]),
    h('How Fast Kids Improve'),
    p('Faster than adults, because they show up, have fun, and don’t overthink.'),
    p('Fight Factory Kids Program in Austin is structured, safe, and fun.'),
    p('Bring your child for a free trial week and watch the difference.'),
  ],
}
