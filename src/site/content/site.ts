// ═══════════════════════════════════════════════════════════════════════════
// site.ts — the academy's own facts and the site's navigation.
//
// Everything quoted from the client is marked VERBATIM and must not be
// rewritten (agency rule: never touch client copy). Anything the academy has
// not supplied yet is exported as a `PENDING` entry and rendered as a visible
// marker rather than invented.
// ═══════════════════════════════════════════════════════════════════════════

export const ACADEMY = {
  name: 'Fight Factory Jiu Jitsu',
  shortName: 'Fight Factory',
  /** VERBATIM — the academy's own motto, used across the old site. */
  motto: 'No Ego. No Drama. Just Jiu-Jitsu.',
  city: 'Austin',
  state: 'TX',
  street: '9607 Research Blvd #675',
  cityLine: 'Austin, TX 78759',
  phone: '(512) 428-6125',
  phoneHref: 'tel:+15124286125',
  email: 'info@fightfactoryjiujitsu.com',
  founded: '2013',
  mapsUrl:
    'https://www.google.com/maps/place/Fight+Factory+Jiu-jitsu/@30.387902,-97.7405822,15z/data=!4m6!3m5!1s0x8644cc8952204d79:0x3aff3b8d17372cf9!8m2!3d30.3882297!4d-97.7406446!16s%2Fg%2F1yg586v40',
  instagram: 'https://www.instagram.com/fightfactory_jiujitsu/',
  facebook: 'https://www.facebook.com/BrazilianFightFactory',
  coachInstagram: 'https://www.instagram.com/brucutubjj/',
} as const

/** Public tracking ids live in the HTML documents, not here. */
export const SITE_URL = 'https://www.fightfactoryjiujitsu.com'

/** Lead source written into both webhooks by every form on this site, so the
 *  CRM can tell a website enquiry from a paid-traffic landing page lead. */
export const SITE_SOURCE = 'Website - Institutional'

// ── Navigation ────────────────────────────────────────────────────────────
export const HOME_HREF = '/home'

export const NAV = [
  { label: 'Home', href: '/home' },
  { label: 'About', href: '/about' },
  { label: 'Programs', href: '/programs' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Contact', href: '/contact' },
] as const

// ── Social proof ──────────────────────────────────────────────────────────
// Student count and review score come from the client's record in the Novo
// Dash app, which is the authoritative source for both.
export const PROOF = {
  students: 300,
  studentsLabel: '~300',
  googleRating: '5.0',
  googleReviews: 96,
  yearsCoaching: 30,
  foundedYear: 2013,
  affiliates: 3,
} as const

/** The academy's four affiliate schools, named in Rodrigo's own biography. */
export const AFFILIATES = ['San Antonio, TX', 'Belton, TX', 'Marble Falls, TX'] as const

// ── The five values ───────────────────────────────────────────────────────
// VERBATIM from fightfactoryjiujitsu.com, "Why it's important". Presented as a
// numbered record list, not five identical cards.
export const VALUES = [
  {
    name: 'Confidence',
    text: 'You will learn more about yourself through Jiu-Jitsu training and find your voice.',
  },
  {
    name: 'Community',
    text: 'Your instructors and peers are eager to see your growth and lift you towards your goals. We believe with confidence you’re able to accomplish anything.',
  },
  {
    name: 'Humility',
    text: 'Fight Factory keeps ego off the mats to build camaraderie and discipline.',
  },
  {
    name: 'Strength',
    text: 'Jiu-Jitsu is a martial art that can be practiced throughout your lifetime. It maintains your physique and conditions you for daily activity.',
  },
  {
    name: 'Resilience',
    text: 'We’ll build your perseverance for you to experience success. Hardwork and determination will benefit all aspects of your life.',
  },
] as const

// ── Long-form client copy, VERBATIM ───────────────────────────────────────

/** Home / welcome. VERBATIM from the old site's welcome section. */
export const WELCOME_COPY =
  'Fight Factory is a premier Brazilian Jiu Jitsu academy in Austin, Texas, offering world-class BJJ training in a fun, friendly, and competitive environment. Our programs are designed for beginners, experienced practitioners, and high-level competitors alike. At Fight Factory, athletes train together to build each other up, develop technical excellence, and maintain a healthy competitive spirit. Whether you’re new to martial arts or training at an advanced level, our Austin BJJ academy welcomes all experience levels. Join Fight Factory today and train Brazilian Jiu Jitsu in Austin alongside dedicated coaches and champions.'

/** About page opener. VERBATIM from /about-us. */
export const ABOUT_OPENER =
  'Brazilian Jiu-Jitsu transforms you into a stronger, more confident version of yourself. It’s more than just a workout, it’s a powerful journey that brings balance to your mind and body. As you grow on the mat, you’ll gain new perspective, inner strength, and discipline that extends into every part of your life. At Fight Factory, we’re committed to helping you unlock your full potential physically, mentally, and spiritually.'

/** About page, the academy's approach. VERBATIM from the old home page. */
export const APPROACH_COPY =
  'Our approach to grappling emphasizes self-defense, not aggression, allowing students to master the art without causing harm. This commitment to safety is reflected in every aspect of our training environment. Regardless of age or experience, every student is treated with equal respect and encouraged to find harmony between competition and camaraderie. At Fight Factory, we honor every journey, valuing the white belt just as much as the black belt.'

/** Free trial. VERBATIM from the old site's "Try a class for free" band. */
export const TRIAL_COPY =
  'Curious about Jiu-Jitsu? Come train with us and enjoy your first class completely free. No pressure, just a chance to see if our academy is the right fit for you.'
export const TRIAL_HEADLINE = 'Experience Fight Factory Jiu-Jitsu. No Commitment, No Cost.'

/** Contact. VERBATIM from /contact-us. */
export const CONTACT_COPY =
  'Fight Factory Jiu-Jitsu has everything you need to start your journey, except you! Reach out today and take the first step toward strength, skill, and community.'

/** Schedule. VERBATIM from /schedule. */
export const SCHEDULE_COPY =
  'Start Your Journey Today – If you’re seeking to revolutionize your fitness routine, search no further. At Fight Factory Jiu-Jitsu, we firmly believe that everyone has the capacity for success. Jiu-Jitsu not only benefits the body but also nurtures the mind. With Fight Factory Jiu-Jitsu’s programs, you will conquer self-defense skills while fostering unwavering confidence and empowerment that will endure a lifetime. Our dedicated staff prioritizes the personal growth of each student and stands ready to support you throughout your martial arts journey. Reach out to us with any inquiries regarding our classes and commence your training today!'

/** Gallery. VERBATIM from the old home page. */
export const GALLERY_COPY =
  'Explore photos from our classes, training sessions, and events. Get a glimpse of the action, focus, and camaraderie that define Fight Factory. From intense training drills to unforgettable moments on the mat. This is where champions are made.'

// ── Opening hours, derived from the published class schedule ───────────────
export const HOURS = [
  { days: 'Monday – Thursday', time: '7:00 AM – 8:15 PM' },
  { days: 'Friday', time: '11:00 AM – 7:15 PM' },
  { days: 'Saturday', time: '9:30 AM – 12:00 PM' },
  { days: 'Sunday', time: 'Closed' },
] as const

// ── Content the academy still owes ────────────────────────────────────────
// Rendered as visible markers. Each is one edit away from being finished.
export const PENDING = {
  pricing:
    'Membership pricing is not published yet. The enquiry form routes pricing requests to the team.',
  calebPortrait: 'Portrait pending',
} as const
