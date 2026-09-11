import { useEffect, useRef } from 'react'

const contactItems = [
  {
    label: 'Address',
    text: '9607 Research Blvd, Suite #675, Austin, TX 78759',
    href: 'https://maps.google.com/?q=Fight+Factory+Jiu-Jitsu+Austin+TX',
  },
  {
    label: 'Phone',
    text: '512-428-6125',
    href: 'tel:+15124286125',
  },
]

const quickLinks = [
  { label: 'Classes', href: '#classes' },
  { label: 'Coach', href: '#coach' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ', href: '#faq' },
]

export function Footer() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ctx: any = null
    async function init() {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      ctx = gsap.context(() => {
        gsap.fromTo(cardRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: cardRef.current, start: 'top 90%', once: true } }
        )
      })
    }
    init()
    return () => ctx?.revert()
  }, [])

  return (
    <footer>

      {/* Google Maps embed */}
      <div style={{ height: '420px', width: '100%', display: 'block' }}>
        <iframe
          src="https://maps.google.com/maps?q=Fight+Factory+Jiu-Jitsu,+9607+Research+Blvd,+Austin,+TX+78759&output=embed&z=15"
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Fight Factory Jiu-Jitsu, Austin, TX"
        />
      </div>

      {/* Footer with watermark background */}
      <div style={{ background: '#080808', position: 'relative', overflow: 'hidden', padding: '60px 0 40px' }}>

        {/* Watermark */}
        <div
          aria-hidden
          className="absolute inset-0 flex flex-col justify-center pointer-events-none select-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          {['FIGHT FACTORY', 'FIGHT FACTORY', 'FIGHT FACTORY'].map((t, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'Anton, sans-serif',
                fontSize: 'clamp(5rem, 14vw, 12rem)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.04)',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
                animation: i % 2 === 1
                  ? 'footer-drift-right 18s ease-in-out infinite'
                  : 'footer-drift-left 22s ease-in-out infinite',
                animationDelay: `${i * 2}s`,
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative" style={{ zIndex: 1 }}>
          <div
            ref={cardRef}
            style={{
              background: '#161616',
              opacity: 0,
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '40px 40px 0',
              overflow: 'hidden',
            }}
          >
            {/* Top grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10">

              {/* Brand column */}
              <div className="md:col-span-5">
                <img
                  src="/images/FONTE.webp"
                  alt="Fight Factory Jiu-Jitsu"
                  className="h-9 w-auto object-contain mb-4"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: '1.8', maxWidth: '340px', marginBottom: '24px' }}>
                  Welcome to Fight Factory, a family-friendly Jiu-Jitsu academy in Austin known for combining elite-level instruction with a beginner-friendly environment where kids and adults can build confidence and discipline from day one.
                </p>

                {/* Social icons */}
                <div className="flex gap-3">
                  {[
                    { href: 'https://instagram.com/fightfactory_jiujitsu', icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    )},
                    { href: 'https://www.facebook.com/BrazilianFightFactory', icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    )},
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center transition-all duration-200"
                      style={{
                        width: 38, height: 38,
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.5)',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#CC0000'
                        e.currentTarget.style.color = '#CC0000'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                        e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                      }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact column */}
              <div className="md:col-span-4">
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>
                  Contact
                </p>
                <div className="flex flex-col gap-3">
                  {contactItems.map(item => (
                    <a
                      key={item.text}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: '1.5' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links column */}
              <div className="md:col-span-3">
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>
                  Quick Links
                </p>
                <div className="flex flex-col gap-3">
                  {quickLinks.map(link => (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom bar inside card */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '20px 0' }} className="flex flex-col md:flex-row items-center justify-between gap-2">
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
                © 2026 Fight Factory Jiu-Jitsu · All rights reserved
              </p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
                By Novo Dash
              </p>
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
