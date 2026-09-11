// ═══════════════════════════════════════════════════════════════════════════
// testimonials.ts — the academy's published Google reviews, VERBATIM.
//
// These are the full reviews as the academy publishes them on its own site,
// not the shortened versions the paid-traffic landing page uses. Nothing is
// edited, trimmed or paraphrased.
// ═══════════════════════════════════════════════════════════════════════════

export interface Review {
  id: string
  name: string
  /** VERBATIM. */
  text: string
}

/** VERBATIM section intro from the old site. */
export const REVIEWS_COPY =
  'At Fight Factory, we’re proud to offer a supportive, motivating, and inclusive environment for every student. But don’t just take our word for it. See what our members have to say!'

export const REVIEWS: Review[] = [
  {
    id: 'vipin',
    name: 'Vipin T.',
    text: 'Fantastic BJJ academy in Austin! I recently moved to town this past summer and spent a fair amount of time trying out different gyms around. Really glad I decided to join here. The instruction whether from Professor Rodrigo, the Tackett brothers, or Davis is top notch and very technical. They really do a good job of spending time until you learn everything properly which I appreciate. Plenty of great training partners and everyone comes in with a good attitude which makes it fun to train. I’m very much appreciative of the upper belts who will spend time on the side helping you improve and answering all questions. Highly recommend this to anyone seeking sound training in a fun environment!',
  },
  {
    id: 'laszlo',
    name: 'Laszlo S.',
    text: 'Such a great gym to train BJJ. Both me and my daughter are taking classes. I really love the flexibility with the schedule, they have training in the morning, at noon, in the evenings. Everyone can find a good time to train. Rodrigo and all the coaches are super helpful and respectful. There are some great competitors and high level guys here so you are guaranteed to learn quickly. There is also a lot of roll on the classes which is great. I really can’t think of any problems with this place.',
  },
  {
    id: 'kj',
    name: 'K.J.',
    text: 'I got to drop in and train here about a month ago and learn from ADCC competitor Kody Steele and was pleasantly surprised to see the Tackett brothers also train here. This place really is a fight factory as you can see the competition skill from these young kids training hard in the adult classes. I know there are a lot of training teams in Austin but this room is probably the youngest room I have ever trained with. This room had to be 15-29 easily. My cardio is good but these guys were having a light day training and I was drenched after an hour of training. I had some great rolls and laughs with everyone here and there really is no ego tripping here. Drop-in fee includes their rash guard. Austin is a really tough training ground in general and this place represents that statement.',
  },
  {
    id: 'janice',
    name: 'Janice R.',
    text: 'I visited the gym last week and liked it so much that I decided to sign up. For the past 2 weeks I’ve experienced amazing instruction and training rounds with very welcoming people. I am so happy to be here.',
  },
  {
    id: 'jesse',
    name: 'Jesse M.',
    text: 'I have been training here for several months. Rodrigo and all the instructors are pros, knowledgeable, as well as experts in teaching their discipline. Tons of excellent people that love to roll. I have learned so much in a few months. They are true to the motto “No Ego, No Drama, Just Jiu-Jitsu”.',
  },
]
