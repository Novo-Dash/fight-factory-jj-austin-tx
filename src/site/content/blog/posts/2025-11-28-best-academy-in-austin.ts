import { p, type Post } from '../types'

export const post: Post = {
  slug: 'best-academy-in-austin',
  title: 'Best Jiu-Jitsu Academy in Austin, TX',
  date: '2025-11-28',
  category: 'guide',
  excerpt: 'Fight Factory Jiu-Jitsu was founded in October 2013, at Austin, TX and since then has produced dozens of world champions across multiple organizations.',
  cover: {
    src: '/site/blog/best-academy-in-austin.webp',
    alt: 'The Fight Factory team together on the mat',
    w: 1600,
    h: 544,
  },
  body: [
    p('Fight Factory Jiu-Jitsu was founded in October 2013, at Austin, TX and since then has produced dozens of world champions across multiple organizations. Head Coach Rodrigo Cabral, known worldwide as “Brucutu”, is a 5th-degree Brazilian Jiu-Jitsu black belt with over 20 years of experience at the highest level. With a background in MMA, ADCC, No-Gi, and traditional Gi competition, he is recognized as one of the most experienced and respected BJJ professors in Texas and in the United States.'),
    p('As one of Austin’s premier Jiu-Jitsu instructors, Coach Rodrigo brings a unique combination of technical knowledge, competition strategy, and athlete development. His teaching methods have helped shape beginners, hobbyists, competitors, and professional athletes into well-rounded practitioners both on and off the mats.'),
  ],
}
