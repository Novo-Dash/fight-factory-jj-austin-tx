import { useEffect, useRef, useState } from 'react'
import { BookingProvider } from '../nd'
import { BackToSchoolNavbar } from '../components/layout/BackToSchoolNavbar'
import { BackToSchoolFooter } from '../components/sections/BackToSchoolFooter'
import { useModal } from '../hooks/useModal'
import { BackToSchoolMarquee } from '../components/ui/BackToSchoolMarquee'

// ─── DATA ──────────────────────────────────────────────────────────────────



const steps = [
  { num: '01', color: '#CC0000', label: 'Step 1', text: 'Click the button and fill out the form.' },
  { num: '02', color: '#F9B80E', label: 'Step 2', text: 'Choose your child class type and pick a date & time on the calendar.' },
  { num: '03', color: '#FFFFFF', label: 'Step 3', text: "You'll get email and SMS confirmations with all the details." },
]

const coachStats = [
  { value: '30+', label: 'Years on the Mats' },
  { value: '5°',  label: 'Black Belt' },
  { value: 'UFC', label: 'Champion Trainer' },
]

const coachBullets = [
  { label: 'NOTABLE STUDENT', text: 'Andrew Tackett, UFC BJJ Champion' },
  { label: 'TEACHING METHOD', text: 'Unique beginner onboarding system' },
  { label: 'LOCATION',        text: 'Austin, TX' },
]

const facilityFeatures = [
  '3,800 sqft facility',
  'Locker rooms and showers',
  'Family-friendly atmosphere',
  'Comfortable beginner environment',
  'Clean and organized facility',
]


const testimonials = [
  { id: '1', name: 'Vipin T.',   rating: 5, text: "The training here is incredibly technical. What impressed me most is how the upper belts pay close attention to every student, correcting technique and making sure you're learning the right way. Great academy.", timeAgo: '2 months ago', avatarBg: '#4285F4' },
  { id: '2', name: 'Laszlo S.', rating: 5, text: 'Both me and my daughter train here. The flexible schedule makes it easy for families to attend. The instructors are patient and encouraging, perfect environment for all ages.', timeAgo: '3 months ago', avatarBg: '#34A853' },
  { id: '3', name: 'K.J.',      rating: 5, text: "I dropped in while visiting Austin and was blown away. Got to train with Kody Steele and the Tackett brothers. World-class instruction in a welcoming environment. Will definitely be back.", timeAgo: '5 months ago', avatarBg: '#EA4335' },
  { id: '4', name: 'Janice R.', rating: 5, text: "The instruction here is truly incredible and the people are so welcoming. From day one I felt at home. If you're thinking about trying Jiu-Jitsu in Austin, this is the place.", timeAgo: '6 months ago', avatarBg: '#FF8C00' },
  { id: '5', name: 'Jesse M.',  rating: 5, text: "I've been training here for months now and the team is completely professional with zero ego. Everyone is focused on improvement and helping each other grow. Highly recommend.", timeAgo: '9 months ago', avatarBg: '#9333EA' },
]

const faqItems = [
  { id: '1', question: 'What is Fight Factory?', answer: 'Fight Factory is a family-friendly Jiu-Jitsu academy in Austin helping children build confidence through structured training.' },
  { id: '2', question: 'What is the community like?', answer: 'Our community includes 250+ students and many families whose children started with zero experience.' },
  { id: '3', question: 'Can my child join without experience?', answer: 'Yes. Many children here started with no experience. Our classes are designed especially for beginners.' },
  { id: '4', question: 'How does the free trial class work?', answer: 'Your child will learn basic techniques in a safe, beginner-friendly class guided by experienced instructors.' },
  { id: '5', question: 'What should my child wear to the trial class?', answer: "Just bring comfortable clothes. We'll provide a clean, brand-new uniform at no cost." },
]

// ─── CALENDAR WIDGET ───────────────────────────────────────────────────────

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const CELLS = [null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,null,null,null]
const HIGHLIGHT_CYCLE = [8, 14, 21, 9, 15, 22, 16, 28]

function CalendarWidget() {
  const [idx, setIdx] = useState(0)
  const highlight = HIGHLIGHT_CYCLE[idx]
  useEffect(() => {
    const id = window.setInterval(() => setIdx(i => (i + 1) % HIGHLIGHT_CYCLE.length), 1600)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="rounded-2xl p-3" style={{ background: '#FFFFFF', border: '2px solid rgba(255,255,255,0.12)', boxShadow: '0 6px 0 0 rgba(0,0,0,0.55)' }}>
      <div className="flex items-center justify-between rounded-xl px-3 py-2 mb-3" style={{ background: '#CC0000', boxShadow: '0 3px 0 0 rgba(0,0,0,0.25)' }}>
        <span style={{ fontFamily: "'SuperbusyActivity','Anton',sans-serif", fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#FFFFFF' }}>June</span>
        <div className="flex gap-1">{[0,1,2].map(i => <span key={i} className="rounded-full" style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.8)', display: 'inline-block' }} />)}</div>
      </div>
      <div className="grid grid-cols-7 mb-1" style={{ gap: 2 }}>
        {DAYS.map((d, i) => <div key={i} className="text-center" style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(10,10,10,0.4)' }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7" style={{ gap: 2 }}>
        {CELLS.map((n, i) => {
          if (n === null) return <div key={i} aria-hidden style={{ aspectRatio: '1' }} />
          const isHL = n === highlight
          return (
            <div key={i} className="relative flex items-center justify-center rounded-md" style={{ aspectRatio: '1', background: isHL ? '#CC0000' : 'rgba(10,10,10,0.05)', boxShadow: isHL ? '0 2px 0 0 rgba(0,0,0,0.4)' : 'none', transition: 'background 0.3s ease, box-shadow 0.3s ease' }}>
              {isHL && <span className="absolute rounded-full" style={{ width: 6, height: 6, background: '#F9B80E', top: -2, right: -2, zIndex: 2 }} />}
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: isHL ? '#FFFFFF' : '#0A0A0A', position: 'relative', zIndex: 1 }}>{n}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── SECTIONS ──────────────────────────────────────────────────────────────


function Hero() {
  const { openModal } = useModal()

  return (
    <section className="k-hero-section relative overflow-hidden" style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        @keyframes kPol1 { 0%,100%{transform:rotate(-10deg) translateY(0px)} 50%{transform:rotate(-10deg) translateY(-7px)} }
        @keyframes kPol2 { 0%,100%{transform:rotate(7deg)  translateY(0px)} 50%{transform:rotate(7deg)  translateY(-9px)} }
        @keyframes kPol3 { 0%,100%{transform:rotate(9deg)  translateY(0px)} 50%{transform:rotate(9deg)  translateY(-6px)} }
        @keyframes kPol4 { 0%,100%{transform:rotate(-7deg) translateY(0px)} 50%{transform:rotate(-7deg) translateY(-8px)} }
        @media (max-width:900px) { .k-pol-col { display:none !important; } }
        @media (max-width:768px) {
          .k-hero-section { min-height: unset !important; }
          .k-hero-grid {
            grid-template-columns: 1fr !important;
            padding-top: 88px !important;
            padding-bottom: 40px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            min-height: unset !important;
          }
          .k-hero-title { font-size: 2.8rem !important; letter-spacing: -0.03em !important; line-height: 1.05 !important; }
          .k-hero-body {
            font-size: 0.7rem !important;
            line-height: 1.6 !important;
            max-width: 100% !important;
          }
          .k-hero-btn {
            padding: 1rem 2rem !important;
            font-size: 0.85rem !important;
            letter-spacing: 0.05em !important;
            white-space: nowrap !important;
            width: 100% !important;
            justify-content: center !important;
          }
          .k-hero-mobile-photos { display: flex !important; }
        }
        @media (min-width:769px) {
          .k-hero-mobile-photos { display: none !important; }
        }
      `}</style>

      <div className="k-hero-grid" style={{
        width: '100%',
        maxWidth: 1440,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr minmax(0,620px) 1fr',
        alignItems: 'center',
        minHeight: '100vh',
        paddingTop: 110,
        paddingBottom: 80,
        paddingLeft: 32,
        paddingRight: 32,
        gap: 0,
      }}>

        {/* LEFT column */}
        <div className="k-pol-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: 40, paddingRight: 20 }}>
          <div style={{ width: 310, background: '#fff', padding: '14px 14px 52px', boxShadow: '0 10px 40px rgba(0,0,0,0.13)', animation: 'kPol1 8s ease-in-out infinite', animationFillMode: 'backwards', marginTop: 48, willChange: 'transform' }}>
            <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#111' }}>
              <img src="/kids/imagem/gallery/1.webp" alt="" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
          <div style={{ width: 285, background: '#fff', padding: '14px 14px 50px', boxShadow: '0 10px 40px rgba(0,0,0,0.11)', animation: 'kPol2 9s ease-in-out infinite', animationDelay: '0.4s', animationFillMode: 'backwards', marginRight: '12%', willChange: 'transform' }}>
            <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#111' }}>
              <img src="/kids/imagem/gallery/3.webp" alt="" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, padding: '0 16px' }}>

          {/* Headline */}
          <h1 className="k-hero-title" style={{ fontFamily: "'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize: 'clamp(2.6rem, 4vw, 4.5rem)', letterSpacing: '0.01em', lineHeight: '1.08', textTransform: 'uppercase', color: '#0A0A0A', margin: 0 }}>
            <span style={{ color: '#0A0A0A' }}>This school year, give your child{' '}</span><br className="k-hero-br" />
            <span style={{ color: '#CC0000' }}>confidence that goes{' '}<br className="k-hero-br" />beyond the classroom.</span>
          </h1>

          {/* Divider */}
          <div style={{ width: 48, height: 3, background: '#CC0000', borderRadius: 2, margin: '0 auto' }} />

          {/* Body */}
          <p className="k-hero-body" style={{ color: '#666', fontSize: 'clamp(0.8rem, 0.9vw, 0.875rem)', lineHeight: '1.75', maxWidth: '52ch', margin: 0 }}>
            Children grow the most when they develop both body and character. Fight Factory Back to School is the perfect opportunity for your child to develop lifelong values.
          </p>

          {/* CTA */}
          <button onClick={openModal} className="k-hero-btn inline-flex items-center gap-2 font-bold cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: '#CC0000', color: '#fff', padding: '1rem 2.5rem', fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8, boxShadow: '0 6px 24px rgba(204,0,0,0.35)', minHeight: 52, border: 'none' }}>
            Book a Free Trial Class →
          </button>

          {/* Fotos polaroid — só mobile */}
          <div className="k-hero-mobile-photos" style={{ gap: 16, justifyContent: 'center', marginTop: 8 }}>
            {[
              { src: '/kids/imagem/gallery/1.webp', rot: '-6deg', anim: 'kPol1 14s ease-in-out infinite' },
              { src: '/kids/imagem/gallery/4.webp', rot: '5deg',  anim: 'kPol3 15s ease-in-out infinite' },
            ].map((p, i) => (
              <div key={i} style={{ width: 140, background: '#fff', padding: '10px 10px 36px', boxShadow: '0 8px 28px rgba(0,0,0,0.14)', transform: `rotate(${p.rot})`, animation: p.anim }}>
                <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#111' }}>
                  <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT column */}
        <div className="k-pol-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 40, paddingLeft: 20 }}>
          <div style={{ width: 300, background: '#fff', padding: '14px 14px 52px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', animation: 'kPol3 7s ease-in-out infinite', animationDelay: '0.2s', animationFillMode: 'backwards', marginLeft: '12%', willChange: 'transform' }}>
            <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#111' }}>
              <img src="/kids/imagem/gallery/4.webp" alt="" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
          <div style={{ width: 320, background: '#fff', padding: '14px 14px 54px', boxShadow: '0 10px 40px rgba(0,0,0,0.13)', animation: 'kPol4 10s ease-in-out infinite', animationDelay: '0.6s', animationFillMode: 'backwards', marginTop: 24, willChange: 'transform' }}>
            <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', background: '#111' }}>
              <img src="/kids/imagem/gallery/5.webp" alt="" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

function WhyParents() {
  const { openModal } = useModal()

  const benefits = [
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h4V10H2zM10 20h4V4h-4zM18 20h4v-8h-4z"/></svg>,
      text: 'Learn fundamentals step by step',
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      text: 'Train in a welcoming environment',
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
      text: 'Dedicated instructor during first classes',
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
      text: 'No experience or athletic background required',
    },
    {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      text: 'Build confidence before joining advanced groups',
    },
  ]

  return (
    <section style={{ background: '#FFFFFF', padding: '56px 0 100px', overflow: 'hidden' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 items-center">

          {/* LEFT: photos */}
          <div style={{ position: 'relative', paddingBottom: '8%' }}>
            <div style={{ borderRadius: 28, overflow: 'hidden', aspectRatio: '4/5', boxShadow: '0 32px 80px rgba(0,0,0,0.13)' }}
              onMouseEnter={e => { (e.currentTarget.querySelector('img') as HTMLElement).style.transform = 'scale(1.04)' }}
              onMouseLeave={e => { (e.currentTarget.querySelector('img') as HTMLElement).style.transform = 'scale(1)' }}>
              <img src="/kids/imagem/2.webp" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.7s ease' }} />
            </div>


            {/* Red badge */}
            <div style={{ position: 'absolute', top: '14%', right: '-3%', background: '#CC0000', color: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 10px 28px rgba(204,0,0,0.38)', border: '3px solid #fff', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Tagbogy','Anton',sans-serif", fontSize: '1.6rem', lineHeight: 1 }}>5</div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.9, marginTop: 4, lineHeight: 1.4 }}>Intro<br />Classes</div>
            </div>
          </div>

          {/* RIGHT: content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Label + Title */}
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#CC0000' }}>Why parents choose us</span>
              <h2 style={{ fontFamily: "'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize: 'clamp(2.4rem,4.2vw,4rem)', lineHeight: '1.05', color: '#0A0A0A', margin: '10px 0 0', textTransform: 'uppercase' }}>
                Why do parents choose<br /><span style={{ color: '#CC0000' }}>Fight Factory?</span>
              </h2>
            </div>

            {/* Sub */}
            <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: '1.75', margin: 0, maxWidth: '42ch' }}>
              Fight Factory offers a kids onboarding system unique in Austin: children begin with 5 introductory classes in a separate group from the regular classes, designed to build confidence in their first steps:
            </p>

            {/* Benefits 2-col grid */}
            <div className="k-why-benefits" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {benefits.map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 14,
                  background: '#FAFAFA', border: '1.5px solid #F0F0F0',
                  transition: 'all 0.2s',
                  cursor: 'default',
                  ...(i === benefits.length - 1 && benefits.length % 2 !== 0 ? { gridColumn: '1 / -1' } : {}),
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F0'; e.currentTarget.style.borderColor = 'rgba(204,0,0,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = '#F0F0F0' }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: '#CC0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {b.icon}
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4 }}>{b.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button onClick={openModal} className="bts-cta self-start inline-flex items-center gap-2 font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: '#CC0000', color: '#fff', padding: '0.9rem 2.2rem', fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8, boxShadow: '0 6px 24px rgba(204,0,0,0.3)', border: 'none' }}>
              Book a Free Back to School Trial Class →
            </button>

          </div>
        </div>
      </div>
    </section>
  )
}


function Programs() {
  const { openModal } = useModal()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const cards = [
    {
      id: 'beginner',
      tag: 'BEGINNER',
      title: 'Beginner Kids Program',
      desc: 'Built for children with no experience, using a 5-class onboarding system designed to help kids start confidently.',
      img: '/kids/imagem/kids-program.webp',
      accent: '#CC0000',
    },
    {
      id: 'kids',
      tag: 'KIDS',
      title: 'Kids Program',
      desc: 'Children develop discipline, confidence, focus, and resilience in a safe, structured, family-friendly environment.',
      img: '/kids/imagem/kids-program2.webp',
      accent: '#0A0A0A',
    },
  ]

  const ages: Record<string, string> = {
    beginner: 'Ages 4 – 7',
    kids: 'Ages 8 – 14',
  }

const features: Record<string, string[]> = {
    beginner: ['5-class onboarding', 'Separate beginner group', 'No gear needed'],
    kids: ['Discipline & focus', 'Family-friendly', 'All levels welcome'],
  }

  return (
    <section id="classes" style={{ background: '#F9F7F5', padding: '88px 0', overflow: 'hidden' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="k-prog-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 44 }}>
          <div>
            <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#CC0000', display: 'block', marginBottom: 10 }}>Programs</span>
            <h2 style={{ fontFamily: "'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize: 'clamp(2.6rem,5vw,4.4rem)', lineHeight: '1.0', color: '#0A0A0A', margin: 0, textTransform: 'uppercase' }}>
              Our <span style={{ color: '#CC0000' }}>Classes</span>
            </h2>
          </div>
        </div>

        {/* Cards */}
        <div className="k-prog-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, justifyContent: 'center' }}>
          {cards.map((card) => (
            <div key={card.id}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                borderRadius: 20, overflow: 'hidden', background: '#fff',
                boxShadow: hoveredCard === card.id ? '0 24px 56px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.07)',
                transform: hoveredCard === card.id ? 'translateY(-5px)' : 'translateY(0)',
                transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
                border: '1px solid #EBEBEB',
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
                <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: hoveredCard === card.id ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.6s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />
                {/* Tag + age */}
                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ background: card.accent, color: '#fff', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 8 }}>{card.tag}</span>
                  <span style={{ fontFamily: "'Montserrat',sans-serif", background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', color: '#fff', fontSize: '0.68rem', fontWeight: 600, padding: '4px 11px', borderRadius: 999 }}>{ages[card.id]}</span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '24px 26px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontFamily: "'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize: 'clamp(1.8rem,2.8vw,2.6rem)', color: '#0A0A0A', lineHeight: '1.05', margin: 0, textTransform: 'uppercase' }}>
                  {card.title}
                </h3>
                <p style={{ fontFamily: "'Montserrat',sans-serif", color: '#666', fontSize: '0.875rem', lineHeight: '1.65', margin: 0 }}>
                  {card.desc}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {features[card.id].map((f, i) => (
                    <span key={i} style={{ fontFamily: "'Montserrat',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F5F5F5', border: '1px solid #EBEBEB', borderRadius: 999, padding: '5px 13px', fontSize: '0.78rem', fontWeight: 600, color: '#333' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: card.accent, display: 'inline-block', flexShrink: 0 }} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 52 }}>
          <button onClick={openModal} className="bts-cta inline-flex items-center gap-2 font-bold cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: '#CC0000', color: '#fff', padding: '1rem 2.6rem', fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8, boxShadow: '0 6px 24px rgba(204,0,0,0.32)', border: 'none' }}>
            Book a Free Back to School Trial Class →
          </button>
        </div>

      </div>
    </section>
  )
}

function Process() {
  const { openModal } = useModal()

  const stepIcons = [
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ]

  const stepColors = ['#CC0000', '#F9B80E', '#1a1a1a']

  return (
    <section style={{ background: '#CC0000', padding: '72px 0', position: 'relative', overflow: 'hidden' }}>
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(0deg,rgba(255,255,255,0.05) 0px,rgba(255,255,255,0.05) 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,rgba(255,255,255,0.05) 0px,rgba(255,255,255,0.05) 1px,transparent 1px,transparent 32px)`, zIndex: 0 }} />
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-60px', right: '8%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '3%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', zIndex: 0, pointerEvents: 'none' }} />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 relative" style={{ zIndex: 1 }}>
        {/* Title row — full width above grid */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 999, padding: '5px 14px', marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
            <span style={{ fontFamily: "'Montserrat',sans-serif", color: '#fff', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>3 Simple Steps</span>
          </div>
          <h2 style={{ fontFamily: "'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize: 'clamp(2.6rem,4.5vw,4rem)', lineHeight: '1.0', color: '#FFFFFF', margin: 0, textTransform: 'uppercase' }}>
            How to get started?
          </h2>
        </div>

        <div className="k-proc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'stretch' }}>

          {/* LEFT: calendar centered vertically */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%' }}>
              <CalendarWidget />
            </div>
          </div>

          {/* RIGHT: 3 step cards + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((s, idx) => (
              <div key={s.num}
                style={{ background: '#FFFFFF', borderRadius: 16, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', transition: 'all 0.25s ease', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)' }}
              >
                {/* Number */}
                <span style={{ fontFamily: "'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize: 'clamp(2rem,3.5vw,3rem)', lineHeight: 1, color: stepColors[idx], userSelect: 'none', flexShrink: 0, minWidth: 56 }}>{s.num}</span>
                {/* Divider */}
                <div style={{ width: 1, background: '#EFEFEF', alignSelf: 'stretch', flexShrink: 0 }} />
                {/* Text */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: stepColors[idx], margin: '0 0 4px' }}>{s.label}</p>
                  <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '0.9rem', lineHeight: '1.5', color: '#222', margin: 0 }}>{s.text}</p>
                </div>
                {/* Icon */}
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${stepColors[idx]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stepColors[idx], flexShrink: 0 }}>
                  {stepIcons[idx]}
                </div>
              </div>
            ))}

            {/* CTA */}
            <div className="k-proc-cta" style={{ marginTop: 4, padding: '18px 22px', background: 'rgba(255,255,255,0.13)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <p style={{ fontFamily: "'Montserrat',sans-serif", color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                First class completely free.<br /><strong style={{ color: '#fff' }}>No commitment. No pressure.</strong>
              </p>
              <button onClick={openModal} className="k-proc-cta-btn shrink-0 font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] whitespace-nowrap"
                style={{ background: '#FFFFFF', color: '#CC0000', padding: '0.875rem 1.75rem', borderRadius: 8, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none' }}>
                Schedule Free Back to School Class →
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function KidsTestimonials() {
  const { openModal } = useModal()
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const CARD_W = 300
  const GAP = 20
  const STEP = CARD_W + GAP
  const N = testimonials.length
  const ONE_SET = N * STEP        // px de um set completo
  const SPEED = 0.55              // px por frame (~33px/s)
  const EASE = 0.09               // fator de suavização para setas

  const items = [...testimonials, ...testimonials, ...testimonials]

  const trackRef = useRef<HTMLDivElement>(null)
  const xRef     = useRef(ONE_SET)       // posição atual renderizada (px)
  const targetRef = useRef(ONE_SET)      // posição alvo (drift + setas)
  const pausedRef = useRef(false)
  const rafRef    = useRef(0)

  useEffect(() => {
    function tick() {
      // avança o alvo continuamente (pausa no hover)
      if (!pausedRef.current) {
        targetRef.current += SPEED
        if (targetRef.current >= ONE_SET * 2) targetRef.current -= ONE_SET
      }

      // suaviza xRef em direção ao targetRef
      let diff = targetRef.current - xRef.current
      if (diff >  ONE_SET) diff -= ONE_SET * 2
      if (diff < -ONE_SET) diff += ONE_SET * 2
      xRef.current += diff * EASE
      if (xRef.current >= ONE_SET * 2) xRef.current -= ONE_SET
      if (xRef.current < 0) xRef.current += ONE_SET

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${xRef.current}px)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function prev() {
    targetRef.current -= STEP
    if (targetRef.current < 0) targetRef.current += ONE_SET
  }

  function next() {
    targetRef.current += STEP
    if (targetRef.current >= ONE_SET * 2) targetRef.current -= ONE_SET
  }

  function getInitials(name: string) {
    const parts = name.replace(/\./g, '').trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const Stars = ({ size = 14 }: { size?: number }) => (
    <div style={{ display: 'flex', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill="none">
          <path d="M8 1L9.796 5.879H15L10.854 8.621L12.472 13.5L8 10.677L3.528 13.5L5.146 8.621L1 5.879H6.204L8 1Z" fill="#FBBC04" />
        </svg>
      ))}
    </div>
  )

  const NavBtn = ({ onClick, dir }: { onClick: () => void; dir: 'prev' | 'next' }) => (
    <button
      onClick={onClick}
      style={{ width: 44, height: 44, borderRadius: '50%', border: '1.5px solid #E0E0E0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.2s, background 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#CC0000'; (e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E0E0E0'; (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        {dir === 'prev'
          ? <path d="M10 3L5 8L10 13" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          : <path d="M6 3L11 8L6 13" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
      </svg>
    </button>
  )

  return (
    <section id="reviews" style={{ background: '#FFFFFF', padding: '80px 0 72px', position: 'relative' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* HEADER */}
        <div className="k-testi-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 24, marginBottom: 48 }}>
          <div>
            <span style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#CC0000', display: 'block', marginBottom: 10 }}>Students</span>
            <h2 style={{ fontFamily: "'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize: 'clamp(2.6rem,5vw,4.4rem)', lineHeight: '1.0', color: '#0A0A0A', margin: 0, textTransform: 'uppercase' }}>
              Meet some of <span style={{ color: '#CC0000' }}>our students</span>
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NavBtn onClick={prev} dir="prev" />
            <NavBtn onClick={next} dir="next" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F9F7F5', border: '1px solid #EBEBEB', borderRadius: 14, padding: '12px 18px' }}>
              <div style={{ display: 'flex' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: testimonials[i].avatarBg, border: '2px solid #fff', marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                    {getInitials(testimonials[i].name)}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#0A0A0A' }}>5.0</span>
                  <Stars size={13} />
                </div>
                <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '0.68rem', color: '#999', marginTop: 1 }}>Google reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* CAROUSEL — scroll contínuo via rAF, pausa no hover */}
        <div
          style={{ overflow: 'hidden', position: 'relative' }}
          onMouseEnter={() => { pausedRef.current = true }}
          onMouseLeave={() => { pausedRef.current = false; setHoveredCard(null) }}
        >
          <div
            ref={trackRef}
            style={{ display: 'flex', gap: GAP, willChange: 'transform' }}
          >
            {items.map((t, idx) => (
              <div
                key={`${t.id}-${idx}`}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  flexShrink: 0, width: CARD_W,
                  background: '#FAFAFA',
                  borderRadius: 20, padding: '26px 24px',
                  border: hoveredCard === idx ? '1.5px solid #CC0000' : '1.5px solid #EBEBEB',
                  boxShadow: hoveredCard === idx ? '0 14px 40px rgba(204,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
                  transform: hoveredCard === idx ? 'translateY(-6px)' : 'translateY(0)',
                  opacity: hoveredCard === null ? 1 : hoveredCard === idx ? 1 : 0.55,
                  transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s, opacity 0.25s',
                  position: 'relative', overflow: 'hidden',
                  cursor: 'default',
                }}>
                <div style={{ position: 'absolute', top: 12, right: 18, fontFamily: 'Georgia,serif', fontSize: '4.5rem', color: 'rgba(204,0,0,0.08)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>"</div>
                <Stars size={14} />
                <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '0.875rem', lineHeight: '1.7', color: '#444', margin: '14px 0 20px' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #F0F0F0', paddingTop: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                    {getInitials(t.name)}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#0A0A0A' }}>{t.name}</div>
                    <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: '0.68rem', color: '#AAA', marginTop: 1 }}>{t.timeAgo}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <button onClick={openModal} className="bts-cta inline-flex items-center gap-2 font-bold cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: '#CC0000', color: '#fff', padding: '1rem 2.4rem', fontSize: '0.875rem', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8, boxShadow: '0 6px 24px rgba(204,0,0,0.32)', border: 'none' }}>
            Book a Free Back to School Trial Class →
          </button>
        </div>

      </div>
    </section>
  )
}

const allFacilityPhotos = [
  { src: '/kids/imagem/gallery/1.webp', alt: 'Kids training' },
  { src: '/kids/imagem/gallery/2.webp', alt: 'Kids class' },
  { src: '/kids/imagem/gallery/3.webp', alt: 'Academy' },
  { src: '/kids/imagem/gallery/4.webp', alt: 'Training session' },
]

function KidsFacility() {
  const [hoveredPhoto, setHoveredPhoto] = useState<number | null>(null)
  const { openModal } = useModal()

  const photos = allFacilityPhotos

  return (
    <section style={{ background: '#FFFFFF', padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes kfFloat1 { 0%,100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(-2deg); } }
        @keyframes kfFloat2 { 0%,100% { transform: translateY(0px) rotate(1.5deg); } 50% { transform: translateY(-8px) rotate(1.5deg); } }
        @keyframes kfFloat3 { 0%,100% { transform: translateY(0px) rotate(-1deg); } 50% { transform: translateY(-12px) rotate(-1deg); } }
        @keyframes kfFloat4 { 0%,100% { transform: translateY(0px) rotate(2deg); } 50% { transform: translateY(-6px) rotate(2deg); } }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative" style={{ zIndex: 1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* LEFT: text */}
          <div className="flex flex-col gap-6">
            <h2 style={{ fontFamily: "'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize: 'clamp(2.6rem,5vw,4.2rem)', lineHeight: '1.05', color: '#0A0A0A', margin: 0, textTransform: 'uppercase' }}>
              <span style={{ color: '#CC0000' }}>For kids to learn confidently,</span><br />they need the right environment.
            </h2>
            <p style={{ color: '#555', fontSize: 'clamp(1rem,0.5vw + 0.875rem,1.125rem)', lineHeight: '1.65', margin: 0 }}>
              Fight Factory was designed to help children feel comfortable from day one, with:
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {facilityFeatures.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#CC0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontSize: '0.9375rem', color: '#333', fontWeight: 500 }}>{f}</span>
                </li>
              ))}
            </ul>
            <button onClick={openModal} className="bts-cta inline-flex items-center gap-2 font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] self-start"
              style={{ background: '#CC0000', color: '#fff', padding: '0.875rem 1.75rem', borderRadius: 8, fontSize: '0.8125rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Book a Free Back to School Trial Class →
            </button>
          </div>

          {/* RIGHT: bento photo cards */}
          <div className="k-facility-bento" style={{ position: 'relative', height: 520 }}>
            {/* Card 1 — large top-left */}
            <div
              onMouseEnter={() => setHoveredPhoto(0)}
              onMouseLeave={() => setHoveredPhoto(null)}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '58%', height: '55%',
                borderRadius: 20, overflow: 'hidden',
                boxShadow: hoveredPhoto === 0 ? '0 20px 50px rgba(0,0,0,0.22)' : '0 8px 24px rgba(0,0,0,0.12)',
                animation: 'kfFloat1 4s ease-in-out infinite',
                transform: hoveredPhoto === 0 ? 'scale(1.04) rotate(-2deg)' : undefined,
                transition: 'box-shadow 0.3s ease',
                zIndex: hoveredPhoto === 0 ? 4 : 1,
                border: '3px solid #fff',
              }}
            >
              <img src={photos[0].src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Card 2 — top-right */}
            <div
              onMouseEnter={() => setHoveredPhoto(1)}
              onMouseLeave={() => setHoveredPhoto(null)}
              style={{
                position: 'absolute', top: '5%', right: 0,
                width: '38%', height: '42%',
                borderRadius: 20, overflow: 'hidden',
                boxShadow: hoveredPhoto === 1 ? '0 20px 50px rgba(0,0,0,0.22)' : '0 8px 24px rgba(0,0,0,0.12)',
                animation: 'kfFloat2 5s ease-in-out infinite',
                transition: 'box-shadow 0.3s ease',
                zIndex: hoveredPhoto === 1 ? 4 : 2,
                border: '3px solid #fff',
              }}
            >
              <img src={photos[1].src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Card 3 — bottom-left */}
            <div
              onMouseEnter={() => setHoveredPhoto(2)}
              onMouseLeave={() => setHoveredPhoto(null)}
              style={{
                position: 'absolute', bottom: 0, left: '5%',
                width: '40%', height: '42%',
                borderRadius: 20, overflow: 'hidden',
                boxShadow: hoveredPhoto === 2 ? '0 20px 50px rgba(0,0,0,0.22)' : '0 8px 24px rgba(0,0,0,0.12)',
                animation: 'kfFloat3 4.5s ease-in-out infinite',
                transition: 'box-shadow 0.3s ease',
                zIndex: hoveredPhoto === 2 ? 4 : 1,
                border: '3px solid #fff',
              }}
            >
              <img src={photos[2].src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Card 4 — bottom-right */}
            <div
              onMouseEnter={() => setHoveredPhoto(3)}
              onMouseLeave={() => setHoveredPhoto(null)}
              style={{
                position: 'absolute', bottom: '3%', right: '2%',
                width: '53%', height: '50%',
                borderRadius: 20, overflow: 'hidden',
                boxShadow: hoveredPhoto === 3 ? '0 20px 50px rgba(0,0,0,0.22)' : '0 8px 24px rgba(0,0,0,0.12)',
                animation: 'kfFloat4 3.8s ease-in-out infinite',
                transition: 'box-shadow 0.3s ease',
                zIndex: hoveredPhoto === 3 ? 4 : 2,
                border: '3px solid #fff',
              }}
            >
              <img src={photos[3].src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Decorative dot */}
            <div className="k-facility-dot" style={{ position: 'absolute', top: '46%', left: '45%', width: 16, height: 16, borderRadius: '50%', background: '#CC0000', zIndex: 5, boxShadow: '0 0 0 4px rgba(204,0,0,0.2)' }} />
          </div>

        </div>
      </div>
    </section>
  )
}

function Coach() {
  const { openModal } = useModal()

  return (
    <section id="coach" style={{ background: '#CC0000', padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes coachFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes coachBadge { 0%,100%{transform:rotate(-3deg) scale(1)} 50%{transform:rotate(-3deg) scale(1.04)} }
      `}</style>

      {/* Decorative blobs */}
      <div style={{ position:'absolute', top:'-80px', right:'-80px', width:320, height:320, borderRadius:'50%', background:'rgba(204,0,0,0.06)', zIndex:0 }} />
      <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:240, height:240, borderRadius:'50%', background:'rgba(204,0,0,0.05)', zIndex:0 }} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative" style={{ zIndex:1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* LEFT: photo with decorative elements */}
          <div style={{ position:'relative', display:'flex', justifyContent:'center' }}>
            {/* Background shape */}
            <div style={{ position:'absolute', top:'8%', left:'5%', width:'80%', height:'84%', borderRadius:32, background:'linear-gradient(135deg, #CC0000 0%, #8B0000 100%)', zIndex:0 }} />

            {/* Photo — floating */}
            <div style={{ position:'relative', zIndex:2, animation:'coachFloat 4s ease-in-out infinite', width:'78%' }}>
              <img src="/kids/imagem/10.webp" alt="Coach Rodrigo Cabral"
                style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover', objectPosition:'top', borderRadius:24, boxShadow:'0 24px 60px rgba(0,0,0,0.18)', display:'block', border:'4px solid #fff' }} />
            </div>

            {/* Badge — 5th Degree */}
            <div style={{ position:'absolute', bottom:'14%', right:'6%', zIndex:3, background:'#CC0000', color:'#fff', borderRadius:14, padding:'12px 16px', boxShadow:'0 8px 24px rgba(204,0,0,0.35)', animation:'coachBadge 3.5s ease-in-out infinite', border:'3px solid #fff' }}>
              <div style={{ fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', opacity:0.75, marginBottom:3 }}>Black Belt</div>
              <div style={{ fontFamily:"'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize:'1.1rem', fontWeight:700 }}>5th Degree</div>
            </div>

            {/* Years badge */}
            <div style={{ position:'absolute', top:'12%', right:'4%', zIndex:3, background:'#fff', borderRadius:14, padding:'10px 14px', boxShadow:'0 8px 24px rgba(0,0,0,0.1)', border:'2px solid #E8ECF8' }}>
              <div style={{ fontFamily:"'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize:'1.5rem', color:'#CC0000', lineHeight:1, fontWeight:700 }}>30+</div>
              <div style={{ fontSize:'0.65rem', color:'#888', marginTop:3 }}>Years on the Mats</div>
            </div>
          </div>

          {/* RIGHT: content */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:24, height:3, background:'rgba(255,255,255,0.6)', borderRadius:999 }} />
              <span style={{ fontFamily:"'Montserrat',sans-serif", color:'rgba(255,255,255,0.7)', fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', fontWeight:700 }}>Coach</span>
            </div>

            <h2 style={{ fontFamily:"'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize:'clamp(2.5rem,5vw,4rem)', lineHeight:1.05, color:'#FFFFFF', margin:0, textTransform:'uppercase' }}>
              Meet Rodrigo, head coach
            </h2>

            {/* Stats cards */}
            <div className="k-coach-stats" style={{ display:'flex', gap:12 }}>
              {coachStats.map((s, i) => (
                <div key={s.label} style={{ flex:1, background: i===0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', borderRadius:14, padding:'14px 16px', border:'1.5px solid rgba(255,255,255,0.25)' }}>
                  <div style={{ fontFamily:"'Tagbogy','HipsterHatch','Anton',sans-serif", fontSize:'clamp(1.5rem,2.5vw,2rem)', color:'#FFFFFF', lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.65)', marginTop:5, letterSpacing:'0.04em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.9375rem', lineHeight:'1.75', margin:0 }}>
              Rodrigo Cabral has over 30 years on the mats and developed the same method that helped shape current champion Andrew Tackett. Today, he helps children grow with confidence through Jiu-Jitsu.
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {coachBullets.map(b => (
                <div key={b.label} className="k-coach-bullet-row" style={{ display:'flex', alignItems:'center', gap:12, background:'#FFFFFF', borderRadius:10, padding:'10px 14px', border:'1px solid rgba(204,0,0,0.15)' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#CC0000', flexShrink:0 }} />
                  <span className="k-coach-bullet-label" style={{ color:'rgba(204,0,0,0.55)', fontSize:'0.625rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', minWidth:110 }}>{b.label}</span>
                  <span style={{ color:'#CC0000', fontSize:'0.875rem', fontWeight:600 }}>{b.text}</span>
                </div>
              ))}
            </div>

            <button onClick={openModal} className="bts-cta self-start inline-flex items-center gap-2 font-bold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] min-h-[52px]"
              style={{ background:'#fff', color:'#CC0000', padding:'1rem 2.5rem', borderRadius:10, fontSize:'0.9rem', letterSpacing:'0.04em', fontWeight:700 }}>
              Book a Free Back to School Trial Class →
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}

function KidsFAQ() {
  const [open, setOpen] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const { openModal } = useModal()

  return (
    <section id="faq" style={{ background: '#F4F4F4', padding: '104px 0' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="k-faq-grid" style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: 96, alignItems: 'start' }}>

          {/* Coluna esquerda — sticky */}
          <div className="k-faq-sticky" style={{ position: 'sticky', top: 120 }}>
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#CC0000',
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20,
            }}>
              <span style={{ display: 'inline-block', width: 20, height: 1.5, background: '#CC0000', borderRadius: 2 }} />
              COMMON QUESTIONS
            </span>

            <h2 style={{
              fontFamily: "'HipsterHatch','Tagbogy','Anton',sans-serif",
              fontSize: 'clamp(2.8rem,4.5vw,4rem)',
              textTransform: 'uppercase',
              lineHeight: 1.05,
              color: '#0A0A0A',
              marginBottom: 36,
              letterSpacing: '-0.01em',
            }}>
              Common<br /><span style={{ color: '#CC0000' }}>Questions</span>
            </h2>

            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: 36, maxWidth: 260 }}>
              Can't find your answer? Book a free class and ask us in person.
            </p>

            <button
              onClick={openModal}
              className="bts-cta"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#CC0000', color: '#fff',
                padding: '0.9rem 1.75rem', borderRadius: 8,
                fontSize: '0.875rem', fontWeight: 700,
                cursor: 'pointer', border: 'none',
                letterSpacing: '0.015em', transition: 'background 0.2s',
                boxShadow: '0 4px 16px rgba(204,0,0,0.28)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#AA0000' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#CC0000' }}
            >
              Book a Free Back to School Trial Class →
            </button>
          </div>

          {/* Coluna direita — accordion numerado */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqItems.map((item, i) => (
              <div
                key={item.id}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: open === item.id || hovered === item.id ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: `1px solid ${open === item.id ? 'rgba(204,0,0,0.15)' : hovered === item.id ? 'rgba(204,0,0,0.07)' : 'transparent'}`,
                  boxShadow: open === item.id
                    ? '0 8px 32px rgba(0,0,0,0.07)'
                    : hovered === item.id
                      ? '0 6px 20px rgba(0,0,0,0.06)'
                      : '0 1px 4px rgba(0,0,0,0.03)',
                  transform: hovered === item.id && open !== item.id ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, transform 0.35s ease',
                }}
              >
                <button
                  onClick={() => setOpen(open === item.id ? null : item.id)}
                  aria-expanded={open === item.id}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 16, padding: '22px 24px',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {/* Número */}
                  <span style={{
                    flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
                    background: open === item.id ? '#CC0000' : 'transparent',
                    color: open === item.id ? '#fff' : '#CC0000',
                    border: `1.5px solid ${open === item.id ? '#CC0000' : '#D8D8D8'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.04em',
                    transition: 'all 0.25s',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Pergunta */}
                  <span style={{
                    flex: 1, fontWeight: 600, fontSize: '0.9375rem',
                    color: open === item.id ? '#0A0A0A' : '#1A1A1A',
                    lineHeight: 1.5, letterSpacing: '0.005em',
                  }}>
                    {item.question}
                  </span>

                  {/* Toggle */}
                  <span style={{
                    flexShrink: 0,
                    width: 28, height: 28, borderRadius: '50%',
                    background: open === item.id ? 'rgba(204,0,0,0.08)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: open === item.id ? '#CC0000' : '#BBBBBB',
                    transform: open === item.id ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'all 0.25s',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>

                {/* Resposta */}
                <div style={{ maxHeight: open === item.id ? 240 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                  <p className="k-faq-answer" style={{
                    padding: '4px 24px 24px 78px',
                    color: '#666', lineHeight: 1.8, fontSize: '0.9125rem',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                    paddingTop: 16,
                  }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

// ─── PAGE ──────────────────────────────────────────────────────────────────

export function BackToSchoolPage() {
  useEffect(() => {
    const prevTitle = document.title
    document.title = 'Back to School | Fight Factory Jiu-Jitsu Austin'
    document.body.style.fontFamily = "'Montserrat', sans-serif"
    // Inject global style for the back to school page
    const style = document.createElement('style')
    style.id = 'bts-font-override'
    style.textContent = `
      p, a, li, button, input, label {
        font-family: 'Montserrat', sans-serif;
      }
      @media (max-width:640px) {
        .bts-cta {
          font-size: 0.72rem !important;
          letter-spacing: 0.04em !important;
          padding-left: 1.15rem !important;
          padding-right: 1.15rem !important;
          line-height: 1.35 !important;
          text-align: center !important;
          justify-content: center !important;
        }
      }
      @media (max-width:480px) {
        h2 { word-break: break-word; }
        section h2 { font-size: clamp(1.75rem, 8vw, 2.2rem) !important; line-height: 1.12 !important; }
        .k-why-benefits { grid-template-columns: 1fr !important; }
        .k-prog-header { align-items: flex-start !important; }
        .k-prog-header p { text-align: left !important; max-width: 100% !important; }
        .k-prog-cards { grid-template-columns: 1fr !important; }
        .k-proc-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        .k-proc-cta { flex-direction: column !important; align-items: stretch !important; }
        .k-proc-cta-btn { width: 100% !important; white-space: normal !important; flex-shrink: 1 !important; justify-content: center !important; text-align: center !important; }
        .k-testi-header { grid-template-columns: 1fr !important; }
        .k-facility-bento {
          position: static !important;
          height: auto !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
        }
        .k-facility-bento > div {
          position: static !important;
          width: 100% !important;
          height: 140px !important;
          transform: none !important;
          animation: none !important;
        }
        .k-facility-dot { display: none !important; }
        .k-coach-stats { flex-wrap: wrap !important; }
        .k-coach-stats > div { min-width: calc(50% - 6px) !important; flex: none !important; }
        .k-coach-bullet-row { flex-wrap: wrap !important; }
        .k-coach-bullet-label { min-width: unset !important; }
        .k-faq-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        .k-faq-sticky { position: static !important; }
        .k-faq-answer { padding-left: 24px !important; padding-right: 16px !important; }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.title = prevTitle
      document.body.style.fontFamily = ''
      document.getElementById('bts-font-override')?.remove()
    }
  }, [])

  return (
    <BookingProvider audience="kids" source="Landing Page - Back to School">
      <BackToSchoolNavbar />
      <main>
        <Hero />
        <BackToSchoolMarquee />
        <WhyParents />
        <Programs />
        <Process />
        <KidsTestimonials />
        <KidsFacility />
        <Coach />
        <KidsFAQ />
      </main>
      <BackToSchoolFooter />
    </BookingProvider>
  )
}
























