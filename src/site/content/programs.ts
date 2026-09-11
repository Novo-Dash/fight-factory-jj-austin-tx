// ═══════════════════════════════════════════════════════════════════════════
// programs.ts — the academy's programmes and the class types inside them.
//
// The two programme descriptions are VERBATIM from the academy's own
// /adult-jiu-jitsu-programs and /kids-program pages. Class names, belt
// qualifiers and age brackets are the ones on the academy's live schedule.
// ═══════════════════════════════════════════════════════════════════════════

import type { Track } from './schedule'

export interface Program {
  slug: string
  eyebrow: string
  title: string
  ages: string
  /** VERBATIM client copy. */
  copy: string
  photo: string
  /** Class types that belong to this programme. */
  classes: { name: string; note: string; days: string; times: string; track: Track }[]
}

export const ADULTS: Program = {
  slug: 'adults',
  eyebrow: 'Ages 13 and up',
  title: 'Adults\nBrazilian\nJiu-Jitsu',
  ages: '13+',
  copy: 'Brazilian Jiu-Jitsu (BJJ) has surged in popularity, and for good reason. Designed for real-world self-defense, BJJ teaches practical techniques that anyone can use, regardless of size or strength. Focusing on ground control, it incorporates holds, throws, and submissions that allow you to neutralize larger opponents effectively, without relying on brute force or causing harm. It’s a smart, skill-based approach to personal protection that everyone can benefit from.',
  photo: '/site/programs/adults-gi.webp',
  classes: [
    {
      name: 'Gi · All Levels',
      note: 'Every belt on the mat together. The default class.',
      days: 'Mon · Wed · Thu · Fri · Sat',
      times: '7:00 AM · 11:00 AM · 6:15 PM',
      track: 'gi',
    },
    {
      name: 'No-Gi · All Levels',
      note: 'Shorts and rash guard. Grips replaced by control.',
      days: 'Mon – Fri',
      times: '7:00 AM · 11:00 AM · 12:00 PM · 6:15 PM · 7:15 PM',
      track: 'nogi',
    },
    {
      name: 'White Belts Only',
      note: 'A room of first-timers. Nobody outranks anybody.',
      days: 'Friday',
      times: '5:00 PM',
      track: 'gi',
    },
    {
      name: 'White & Blue',
      note: 'The fundamentals block, gi and no-gi.',
      days: 'Mon – Wed',
      times: '6:15 PM',
      track: 'gi',
    },
    {
      name: 'Blue & Above',
      note: 'Advanced technique and hard rounds.',
      days: 'Mon · Tue · Wed',
      times: '7:15 PM',
      track: 'nogi',
    },
    {
      name: 'Wrestling',
      note: 'Takedowns and top pressure, taught by wrestlers.',
      days: 'Monday',
      times: '11:00 AM',
      track: 'wrestling',
    },
    {
      name: "Women's Class",
      note: 'Women-only mat time, all levels welcome.',
      days: 'Tue · Thu · Sat',
      times: '12:30 PM · 9:30 AM',
      track: 'womens',
    },
  ],
}

export const KIDS: Program = {
  slug: 'kids',
  eyebrow: 'Ages 4 to 12',
  title: 'Kids\nBrazilian\nJiu-Jitsu',
  ages: '4–12',
  copy: 'At Fight Factory Jiu-Jitsu, we believe in building strong foundations early. Our Kids BJJ Program offers a safe, supportive space where children can improve fitness, gain confidence, and develop discipline through the art of Brazilian Jiu-Jitsu. Designed for ages 4–6 and 7–12, each class is led by experienced instructors who focus on both skill development and character growth, helping kids succeed on and off the mat.',
  photo: '/site/programs/kids-a.webp',
  classes: [
    {
      name: 'Kids Gi · Ages 4–6',
      note: 'Forty-five minutes of games that happen to be Jiu-Jitsu.',
      days: 'Mon · Wed · Thu',
      times: '4:30 PM',
      track: 'kids',
    },
    {
      name: 'Kids Gi · Ages 7–12',
      note: 'Technique, drilling and controlled rounds.',
      days: 'Mon · Wed · Thu',
      times: '5:15 PM',
      track: 'kids',
    },
    {
      name: 'Kids No-Gi · Ages 8+',
      note: 'The no-gi block for the older group.',
      days: 'Tuesday',
      times: '5:00 PM',
      track: 'kids',
    },
  ],
}

export const PROGRAMS = [ADULTS, KIDS]

/** Which class a newcomer should walk into, by situation. */
export const STARTING_POINTS = [
  {
    who: 'Never trained anything',
    pick: 'White Belts Only',
    when: 'Friday, 5:00 PM',
    why: 'A whole class of people on their first month. No upper belts watching.',
  },
  {
    who: 'New, but wants the normal room',
    pick: 'Gi · All Levels',
    when: 'Mon · Wed · Thu · Fri · Sat',
    why: 'Beginners train alongside every belt. The coaches pair you deliberately.',
  },
  {
    who: 'Wrestled or trained before',
    pick: 'No-Gi · All Levels',
    when: 'Mon – Fri',
    why: 'Closest to what you already know. Grips come later.',
  },
  {
    who: 'Wants women-only mat time',
    pick: "Women's Class",
    when: 'Tue · Thu, 12:30 PM · Sat, 9:30 AM',
    why: 'All levels, coached by a No-Gi World Champion.',
  },
  {
    who: 'A child, 4 to 6',
    pick: 'Kids Gi · Ages 4–6',
    when: 'Mon · Wed · Thu, 4:30 PM',
    why: 'Forty-five minutes. Movement, balance and taking turns.',
  },
  {
    who: 'A child, 7 to 12',
    pick: 'Kids Gi · Ages 7–12',
    when: 'Mon · Wed · Thu, 5:15 PM',
    why: 'Real technique, with the character work built in.',
  },
]

/** What actually happens on a first visit. Three steps, no invention. */
export const FIRST_CLASS = [
  {
    n: '01',
    title: 'Book the class',
    text: 'Pick a programme, then a date and time from the academy’s live calendar. You get email and SMS confirmation.',
  },
  {
    n: '02',
    title: 'Turn up fifteen minutes early',
    text: 'Comfortable clothes are enough. A clean uniform is provided at no cost. A coach walks you through the room before class starts.',
  },
  {
    n: '03',
    title: 'Train',
    text: 'Warm-up, technique, then drilling with a partner the coach chooses for you. Rolling is optional on a first class.',
  },
]
