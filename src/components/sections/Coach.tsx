import { Button } from '../ui/Button'

const stats = [
  { value: '30+', label: 'Years on the Mats' },
  { value: '5°',  label: 'Black Belt' },
  { value: 'UFC', label: 'Champion Trainer' },
]

export function Coach() {
  return (
    <section
      id="coach"
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #1c1c1e 0%, #111 60%, #0A0A0A 100%)',
        padding: '96px 0',
      }}
    >
      {/* Red glow */}
      <div className="absolute pointer-events-none" style={{
        top: '50%', left: '20%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(ellipse, rgba(204,0,0,0.09) 0%, transparent 65%)',
      }} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative" style={{ zIndex: 1 }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">

          {/* LEFT — photo card */}
          <div className="md:col-span-5 relative">
            <div style={{
              position: 'absolute', inset: 0, top: 16, left: 16,
              borderRadius: '20px',
              border: '1.5px solid rgba(204,0,0,0.4)',
              zIndex: 0,
            }} />
            <div style={{
              position: 'relative', zIndex: 1,
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              aspectRatio: '3/4',
            }}>
              <img src="/images/10.webp" alt="Coach Rodrigo Cabral" className="w-full h-full object-cover object-top" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.75) 100%)' }} />
              <div style={{
                position: 'absolute', bottom: 20, left: 20, right: 20,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Head Instructor</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}>Rodrigo Cabral</div>
                </div>
                <div style={{ background: 'rgba(204,0,0,0.2)', border: '1px solid rgba(204,0,0,0.45)', borderRadius: '8px', padding: '6px 10px', color: '#CC0000', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  5th Degree
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — content */}
          <div className="md:col-span-7 flex flex-col gap-7 md:pl-6">
            <div className="flex items-center gap-3">
              <div style={{ width: 28, height: 2, background: '#CC0000', borderRadius: 9999 }} />
              <span style={{ color: '#CC0000', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Meet Rodrigo, head coach</span>
            </div>

            <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(2.75rem, 4.5vw, 4rem)', letterSpacing: '0.01em', lineHeight: 1, textTransform: 'uppercase', color: '#FFFFFF' }}>
              Rodrigo Cabral
            </h2>

            <div className="flex gap-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '20px 0' }}>
              {stats.map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', color: '#fff', lineHeight: 1, letterSpacing: '0.02em' }}>{s.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9375rem', lineHeight: '1.8', maxWidth: '440px' }}>
              Rodrigo Cabral, with over 30 years on the mats, developed the method that helped shape current champion Andrew Tackett, combining elite technique with a beginner-friendly teaching style. You can experience his method yourself in a free trial class.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { label: 'Notable Student', value: 'Andrew Tackett, UFC BJJ Champion' },
                { label: 'Teaching Method', value: 'Unique beginner onboarding system' },
                { label: 'Location',        value: 'Austin, TX' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#CC0000', flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, minWidth: 110 }}>{c.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>{c.value}</span>
                </div>
              ))}
            </div>

            <div>
              <Button size="lg" variant="red" openModal>Book your free trial class →</Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
