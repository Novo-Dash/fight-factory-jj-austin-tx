const contactItems = [
  { label: 'Address', text: '9607 Research Blvd #675, Austin, TX 78759', href: 'https://maps.google.com/?q=Fight+Factory+Jiu-Jitsu+Austin+TX' },
  { label: 'Phone',   text: '(512) 428-6125', href: 'tel:+15124286125' },
  { label: 'Email',   text: 'info@fightfactoryjiujitsu.com', href: 'mailto:info@fightfactoryjiujitsu.com' },
]

const quickLinks = [
  { label: 'Classes', href: '#classes' },
  { label: 'Coach',   href: '#coach' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'FAQ',     href: '#faq' },
]

export function BackToSchoolFooter() {
  return (
    <footer>
      {/* Map */}
      <div style={{ height: 360, width: '100%' }}>
        <iframe
          src="https://maps.google.com/maps?q=Fight+Factory+Jiu-Jitsu,+9607+Research+Blvd,+Austin,+TX+78759&output=embed&z=15"
          width="100%" height="100%"
          style={{ border: 0, display: 'block' }}
          allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Fight Factory Jiu-Jitsu, Austin, TX"
        />
      </div>

      {/* Footer body */}
      <div style={{ background: '#0A0A0A', position: 'relative', overflow: 'hidden', padding: '60px 0 0' }}>

        {/* Watermark */}
        <style>{`
          @keyframes kfDriftLeft  { 0%{transform:translateX(0)}    100%{transform:translateX(-50%)} }
          @keyframes kfDriftRight { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
          @keyframes kfDriftSlow  { 0%{transform:translateX(0)}    100%{transform:translateX(-50%)} }
        `}</style>
        <div aria-hidden className="absolute inset-0 flex flex-col justify-center pointer-events-none select-none overflow-hidden" style={{ zIndex: 0 }}>
          {[
            { text: 'BACK TO SCHOOL · BACK TO SCHOOL · BACK TO SCHOOL ·', anim: 'kfDriftLeft 55s linear infinite' },
            { text: '· BACK TO SCHOOL · BACK TO SCHOOL · BACK TO SCHOOL', anim: 'kfDriftRight 70s linear infinite' },
            { text: 'BACK TO SCHOOL · BACK TO SCHOOL · BACK TO SCHOOL ·', anim: 'kfDriftSlow 90s linear infinite' },
          ].map((item, i) => (
            <div key={i} style={{ fontFamily: "'ChildGorlex','Anton',sans-serif", fontSize: 'clamp(3.5rem,10vw,8rem)', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.07)', lineHeight: 1.15, whiteSpace: 'nowrap', animation: item.anim }}>
              {item.text}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative" style={{ zIndex: 1 }}>
          <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '40px 40px 0', overflow: 'hidden' }}>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10">

              {/* Brand */}
              <div className="md:col-span-5">
                <img src="/images/FONTE.webp" alt="Fight Factory Jiu-Jitsu Back to School" className="h-9 w-auto object-contain mb-4" style={{ filter: 'brightness(0) invert(1)' }} />
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', lineHeight: '1.8', maxWidth: 340, marginBottom: 24 }}>
                  Fight Factory Back to School is the perfect opportunity to help your child start the new school year with more confidence. Click any button on this page to book a free trial class and experience the benefits of Brazilian Jiu-Jitsu firsthand.
                </p>
                <div className="flex gap-3">
                  {[
                    { href: 'https://instagram.com/fightfactory_jiujitsu', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                    { href: 'https://www.facebook.com/BrazilianFightFactory', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                  ].map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center transition-all duration-200"
                      style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#CC0000' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                    >{s.icon}</a>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="md:col-span-4">
                <h4 style={{ fontFamily: "'HipsterHatch','Tagbogy','Anton',sans-serif", color: '#fff', fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20, opacity: 0.85 }}>Contact</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {contactItems.map(c => (
                    <li key={c.label}>
                      <a
                        href={c.href}
                        {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', textDecoration: 'none', lineHeight: '1.5', transition: 'color 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}>
                        {c.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick links */}
              <div className="md:col-span-3">
                <h4 style={{ fontFamily: "'HipsterHatch','Tagbogy','Anton',sans-serif", color: '#fff', fontSize: '0.9rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20, opacity: 0.85 }}>Quick Links</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {quickLinks.map(l => (
                    <li key={l.label}>
                      <a href={l.href} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>© 2026 Fight Factory Jiu-Jitsu · All rights reserved.</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>By Novo Dash</span>
            </div>
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </footer>
  )
}


