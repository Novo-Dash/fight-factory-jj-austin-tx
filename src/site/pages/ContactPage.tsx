import { useEffect } from 'react'
import { BookingForm } from '../../booking/BookingForm'
import { trackViewContent } from '../../booking/analytics'
import { MaskHeading } from '../components/MaskHeading'
import { PageHead } from '../components/PageHead'
import { Reveal, Uncover } from '../components/motion'
import { Chapter, Diamond, Pending, Rule } from '../components/ui'
import { Icon } from '../components/Icon'
import { MapEmbed } from '../components/MapEmbed'
import {
  ACADEMY,
  CONTACT_COPY,
  HOURS,
  PENDING,
  PROOF,
  SITE_SOURCE,
  TRIAL_COPY,
} from '../content/site'

/** Questions the academy already answers on its own pages. */
const FAQ = [
  {
    q: 'Can I join if I have never trained before?',
    a: 'Yes. Most people who walk in have never trained anything. Friday at 5:00 PM is a white-belts-only class, and every all-levels class pairs beginners deliberately.',
  },
  {
    q: 'What should I wear to the trial class?',
    a: 'Comfortable clothes are enough. A clean uniform is provided for the trial at no cost.',
  },
  {
    q: 'How does the trial class work?',
    a: 'You book a real class from the academy’s calendar, arrive fifteen minutes early, and train. Warm-up, technique and drilling. Rolling is optional on a first class.',
  },
  {
    q: 'How old does a child need to be?',
    a: 'Four. Ages 4–6 train Monday, Wednesday and Thursday at 4:30 PM; ages 7–12 at 5:15 PM the same days; and there is a no-gi class for 8 and up on Tuesday.',
  },
  {
    q: 'Do you have a women-only class?',
    a: 'Yes. Tuesday and Thursday at 12:30 PM and Saturday at 9:30 AM, all levels, coached by a No-Gi World Champion.',
  },
  {
    q: 'What does membership cost?',
    a: null, // the academy has not published pricing
  },
]

export function ContactPage() {
  // The form is on screen from the moment the page loads, so the funnel's
  // opening event fires on mount — the same thing the /book route does. Without
  // it a visitor who lands here has a Lead with no ViewContent before it.
  useEffect(() => {
    trackViewContent()
  }, [])

  return (
    <>
      <PageHead
        tag="Contact & free trial"
        title={'Ready to\njoin the\nfight?'}
        standfirst={CONTACT_COPY}
      />

      {/* ── The form is the point of the page, so it comes first. ────────── */}
      <section className="wrap py-16 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div>
            <Chapter n="01" label="Book a free class" />
            <MaskHeading text={'Two steps.\nNo card,\nno catch.'} className="t-display mt-9" />
            <Reveal delay={80}>
              <p className="standfirst mt-7 max-w-md text-body">{TRIAL_COPY}</p>
            </Reveal>

            <Rule className="mt-10" />
            <ul className="pt-7">
              {[
                { icon: 'pin' as const, label: 'Address', value: `${ACADEMY.street}, ${ACADEMY.cityLine}`, href: ACADEMY.mapsUrl },
                { icon: 'phone' as const, label: 'Call us anytime', value: ACADEMY.phone, href: ACADEMY.phoneHref },
                { icon: 'mail' as const, label: 'Email us', value: ACADEMY.email, href: `mailto:${ACADEMY.email}` },
              ].map((r, i) => (
                <Reveal as="li" key={r.label} delay={i * 60}>
                  <a
                    href={r.href}
                    target={r.icon === 'pin' ? '_blank' : undefined}
                    rel={r.icon === 'pin' ? 'noreferrer noopener' : undefined}
                    className="record-row group grid-cols-[auto_1fr] items-center !border-t-0 border-b border-rule"
                  >
                    <span className="text-ink">
                      <Icon name={r.icon} size={22} />
                    </span>
                    <span className="min-w-0">
                      <span className="label-sm block text-muted">{r.label}</span>
                      <span className="t-body nums mt-1.5 block break-words transition-colors duration-200 group-hover:text-red">
                        {r.value}
                      </span>
                    </span>
                  </a>
                </Reveal>
              ))}
            </ul>

            <Reveal>
              <div className="mt-9">
                <h3 className="label mb-4 text-muted">Opening hours</h3>
                <ul className="t-body space-y-1.5">
                  {HOURS.map((h) => (
                    <li key={h.days} className="flex justify-between gap-4 text-body">
                      <span>{h.days}</span>
                      <span className="nums shrink-0 text-ink">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* The SHARED booking module, rendered inline. Same form, same live
              calendar, same two webhooks — only the source label differs. */}
          <Reveal delay={60}>
            <div className="border-t-[3px] border-red bg-white shadow-[0_1px_0_var(--color-rule),0_0_0_1px_var(--color-rule)]">
              <BookingForm source={SITE_SOURCE} />
            </div>
            <p className="label-sm mt-5 flex items-center gap-2.5 text-muted">
              <Diamond className="text-red" />
              {PROOF.studentsLabel} students &nbsp;·&nbsp; {PROOF.googleRating} on Google from{' '}
              {PROOF.googleReviews}+ reviews
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Where ────────────────────────────────────────────────────────── */}
      <section className="bg-shell-2">
        <div className="wrap py-20 md:py-24">
          <Chapter n="02" label="Find the door" />
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
            <div>
              <MaskHeading text={'North-west\nAustin, off\nUS-183'} className="t-display" />
              <Reveal delay={80}>
                <p className="standfirst mt-7 max-w-md text-body">
                  The academy is on the Research Boulevard frontage, a minute from the Capital of
                  Texas Highway junction. Parking is in front of the unit.
                </p>
                <a
                  href={ACADEMY.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-ink mt-8"
                >
                  <span className="btn-roll">
                    <span>Get directions</span>
                    <span aria-hidden="true">Get directions</span>
                  </span>
                  <Icon name="pin" size={16} />
                </a>
              </Reveal>
            </div>
            <Reveal delay={60}>
              <MapEmbed />
            </Reveal>
          </div>

          <div className="photo-row mt-12 grid h-[52vw] grid-cols-1 gap-4 sm:h-[22vw] sm:max-h-[300px] sm:grid-cols-3">
            {[
              { src: '/site/facility/shop.webp', alt: 'The reception and pro shop inside the academy' },
              { src: '/site/facility/mat-a.webp', alt: 'The main mat space with windows along one wall' },
              { src: '/site/facility/mat-b.webp', alt: 'A second view of the training floor' },
            ].map((p, i) => (
              <Uncover key={p.src} delay={i * 80} className="h-full">
                <img src={p.src} alt={p.alt} loading="lazy" />
              </Uncover>
            ))}
          </div>
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────────────────── */}
      <section className="wrap py-20 md:py-24">
        <Chapter n="03" label="Before you come in" />
        <MaskHeading text={'Common\nquestions'} className="t-display mt-9" />

        <dl className="mt-12 grid grid-cols-1 gap-x-16 lg:grid-cols-2">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 45}>
              <div className="record-row grid-cols-1">
                <dt className="display-line t-body flex gap-3 !leading-[1.2]">
                  <span className="label-sm nums pt-1 text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {f.q}
                </dt>
                <dd className="t-body mt-3 pl-9 text-body">
                  {f.a ?? <Pending>{PENDING.pricing}</Pending>}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>
    </>
  )
}
