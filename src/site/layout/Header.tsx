import { useEffect, useState } from 'react'
import { useModal } from '../../hooks/useModal'
import { ACADEMY, HOME_HREF, NAV } from '../content/site'
import { Icon } from '../components/Icon'
import { Diamond } from '../components/ui'

/**
 * The masthead.
 *
 * Two wordmark files ship, one dark and one light, and each surface uses the
 * one that belongs there. No CSS filter is applied to either: `invert` on the
 * light asset over a dark panel paints it black, which is the wrong way round
 * and easy to miss.
 */
export function Header({ current, overDark = false }: { current: string; overDark?: boolean }) {
  const { openModal } = useModal()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menu) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [menu])

  // The home page opens on a photograph, so at the top of that page the
  // masthead sits on a dark ground and has to switch to its light artwork.
  // Once the page has scrolled it is back over the shell either way.
  const onDark = overDark && !scrolled

  return (
    <>
      <header
        className={`vt-masthead sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? 'border-b border-rule bg-shell/88 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="wrap flex h-16 items-center justify-between gap-6 md:h-[74px]">
          <a href={HOME_HREF} className="flex shrink-0 items-center" aria-label={`${ACADEMY.name} home`}>
            {/* Sized by WIDTH, not height. The dark and light wordmarks are
                different artwork with different proportions (5.3:1 and 7.1:1),
                so matching their heights makes one of them 50px wider than the
                other — enough to push the masthead off the screen at 768px. */}
            <img
              src={onDark ? '/site/brand/wordmark-light.webp' : '/site/brand/wordmark-ink.webp'}
              alt={ACADEMY.name}
              width={onDark ? 400 : 548}
              height={onDark ? 56 : 101}
              className="h-auto w-[148px] md:w-[164px]"
            />
          </a>

          <nav className="hidden items-center md:flex md:gap-0 lg:gap-1" aria-label="Main">
            {NAV.map((item) => {
              const active = item.href === current
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`label relative px-2.5 py-3 transition-colors duration-200 lg:px-3.5 ${
                    onDark
                      ? active
                        ? 'text-white'
                        : 'text-white/65 hover:text-white'
                      : active
                        ? 'text-ink'
                        : 'text-body hover:text-ink'
                  }`}
                >
                  {item.label}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3.5 bottom-1.5 h-[2px] bg-red"
                    />
                  ) : null}
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={ACADEMY.phoneHref}
              className={`label hidden items-center gap-2 px-3 py-3 transition-colors duration-200 lg:inline-flex ${
                onDark ? 'text-white/70 hover:text-white [--icon-accent:currentColor]' : 'text-body hover:text-ink'
              }`}
            >
              <Icon name="phone" size={16} />
              <span className="nums">{ACADEMY.phone}</span>
            </a>
            <button
              type="button"
              onClick={openModal}
              className="btn btn-red hidden !min-h-[44px] whitespace-nowrap !px-5 !py-3 sm:inline-flex"
            >
              <span className="btn-roll">
                <span>Free trial</span>
                <span aria-hidden="true">Free trial</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              aria-expanded={menu}
              className={`flex h-11 w-11 items-center justify-center border md:hidden ${
                onDark ? 'border-white/30 text-white' : 'border-rule text-ink'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M2 5h16M2 10h16M2 15h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu. The light wordmark, unfiltered, on the ink ground. */}
      {menu ? (
        <div className="fixed inset-0 z-[90] flex flex-col bg-ink text-white plate md:hidden">
          <div className="wrap flex h-16 items-center justify-between">
            <img
              src="/site/brand/wordmark-light.webp"
              alt={ACADEMY.name}
              width={400}
              height={56}
              className="h-[26px] w-auto"
            />
            <button
              type="button"
              onClick={() => setMenu(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center border border-white/25"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>

          <nav className="wrap flex flex-1 flex-col justify-center gap-1 pb-16" aria-label="Main">
            {NAV.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-baseline gap-4 border-t border-white/12 py-5"
              >
                <span className="label-sm nums w-7 shrink-0 text-white/35">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="t-title text-white">{item.label}</span>
                {item.href === current ? <Diamond className="ml-auto self-center text-red" /> : null}
              </a>
            ))}
            <div className="mt-9 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMenu(false)
                  openModal()
                }}
                className="btn btn-red w-full"
              >
                <span className="btn-roll">
                  <span>Book a free trial</span>
                  <span aria-hidden="true">Book a free trial</span>
                </span>
                <Icon name="arrow" size={17} />
              </button>
              <a href={ACADEMY.phoneHref} className="btn btn-ghost-invert w-full">
                <Icon name="phone" size={16} />
                <span className="nums">{ACADEMY.phone}</span>
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  )
}
