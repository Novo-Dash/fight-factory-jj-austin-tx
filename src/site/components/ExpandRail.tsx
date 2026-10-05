import { useState } from 'react'
import { Icon, type IconName } from './Icon'

/**
 * Compressed panels that open.
 *
 * Every panel is a narrow column until the pointer reaches it, at which point
 * it takes the space the others give up and shows what is inside. It is the
 * same information as a grid of cards, in a third of the height, and the
 * hierarchy is doing the explaining rather than six identical boxes.
 *
 * On a touch screen there is no hover to lean on, so below the breakpoint the
 * panels stack and open on tap. That is the whole pattern: never make a phone
 * user guess at a hover.
 */

export interface Panel {
  /** object-position da foto, para o painel fechado (uma lâmina estreita). */
  pos?: string
  id: string
  href: string
  eyebrow: string
  title: string
  meta: string
  photo: string
  alt: string
  icon: IconName
  points: string[]
}

export function ExpandRail({ panels }: { panels: Panel[] }) {
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState<string | null>(panels[0]?.id ?? null)

  return (
    <>
      {/* ── Pointer: one row, panels trade width ─────────────────────────── */}
      <div
        className="hidden h-[32rem] gap-2 md:flex lg:h-[34rem]"
        onMouseLeave={() => setActive(0)}
      >
        {panels.map((p, i) => {
          const isActive = i === active
          return (
            <a
              key={p.id}
              href={p.href}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-current={isActive || undefined}
              className="group relative block min-w-0 overflow-hidden bg-ink transition-[flex-grow] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ flexGrow: isActive ? 3.4 : 1, flexBasis: 0 }}
            >
              <img
                src={p.photo}
                alt={p.alt}
                loading="lazy"
                style={p.pos ? { objectPosition: p.pos } : undefined}
                className={`absolute inset-0 h-full w-full object-cover transition-[transform,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive
                    ? 'scale-100 opacity-100 grayscale-0'
                    : 'scale-[1.08] opacity-80 grayscale'
                }`}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: isActive
                    ? 'linear-gradient(to top, rgba(11,12,13,0.95) 0%, rgba(11,12,13,0.4) 52%, rgba(11,12,13,0.1) 100%)'
                    : 'linear-gradient(to top, rgba(11,12,13,0.62) 0%, rgba(11,12,13,0.3) 60%, rgba(11,12,13,0.45) 100%)',
                }}
              />

              {/* The compressed state: a vertical title and the icon, nothing
                  more. It has to read at 90px wide. */}
              <span
                className={`absolute inset-x-0 top-0 flex flex-col items-center gap-5 p-5 transition-opacity duration-300 ${
                  isActive ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                <Icon name={p.icon} size={24} className="text-white [--icon-accent:#fff]" />
                <span
                  className="display-line whitespace-nowrap text-[0.95rem] text-white/85"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {p.title.replace('\n', ' ')}
                </span>
              </span>

              {/* The open state. */}
              <span
                className={`absolute inset-x-0 bottom-0 block p-6 transition-[opacity,transform] duration-500 lg:p-7 ${
                  isActive ? 'translate-y-0 opacity-100 delay-100' : 'translate-y-3 opacity-0'
                }`}
              >
                <span className="label-sm mb-3 block text-white/60">{p.eyebrow}</span>
                <span className="display-line block whitespace-pre-line text-[clamp(1.5rem,2.2vw,2.1rem)] text-white">
                  {p.title}
                </span>

                <span className="mt-5 block h-px w-full bg-white/20" />
                <ul className="mt-4 space-y-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-[0.85rem] text-white/75">
                      <span aria-hidden="true" className="diamond mt-1.5 text-red" />
                      {pt}
                    </li>
                  ))}
                </ul>

                <span className="mt-6 flex items-center justify-between gap-4">
                  <span className="label-sm nums text-white/45">{p.meta}</span>
                  <span className="flex h-10 w-10 items-center justify-center border border-white/25 text-white transition-colors duration-300 group-hover:border-red group-hover:bg-red [--icon-accent:#fff]">
                    <Icon name="arrow" size={17} />
                  </span>
                </span>
              </span>
            </a>
          )
        })}
      </div>

      {/* ── Touch: stacked, opens on tap ─────────────────────────────────── */}
      <div className="md:hidden">
        {panels.map((p) => {
          const isOpen = open === p.id
          return (
            <div key={p.id} className="border-t border-rule first:border-t-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : p.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 py-5 text-left"
              >
                <Icon name={p.icon} size={22} className="shrink-0 text-ink" />
                <span className="min-w-0 flex-1">
                  <span className="label-sm mb-2 block text-muted">{p.eyebrow}</span>
                  <span className="display-line block text-[1.15rem]">
                    {p.title.replace('\n', ' ')}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-transform duration-300 ${
                    isOpen ? 'rotate-45 border-red text-red' : 'border-rule text-ink'
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              {isOpen ? (
                <div className="pb-6">
                  <a href={p.href} className="relative block aspect-[16/10] overflow-hidden bg-ink">
                    <img src={p.photo} alt={p.alt} loading="lazy" style={p.pos ? { objectPosition: p.pos } : undefined} className="absolute inset-0 h-full w-full object-cover" />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(11,12,13,0.85), rgba(11,12,13,0.1))' }}
                    />
                    <span className="label-sm nums absolute bottom-4 left-4 text-white/70">{p.meta}</span>
                  </a>
                  <ul className="mt-4 space-y-2">
                    {p.points.map((pt) => (
                      <li key={pt} className="t-body flex items-start gap-2.5 text-body">
                        <span aria-hidden="true" className="diamond mt-2 text-red" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}
