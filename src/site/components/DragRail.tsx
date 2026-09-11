import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from './Icon'

/**
 * A rail you can throw.
 *
 * Native horizontal scrolling does the moving, so a trackpad, a touch swipe,
 * the arrow keys and the scrollbar all work without any of this code running.
 * On top of that it adds what a mouse cannot otherwise do: press-and-drag with
 * momentum, and a magnetic settle onto the nearest frame when the throw runs
 * out. Cards lift slightly under the cursor, so the rail reacts before it is
 * even grabbed.
 *
 * Two details that matter:
 *  • CSS scroll snapping is switched OFF for the duration of a drag. Left on,
 *    the browser fights every scrollLeft write and the rail stutters.
 *  • A drag that travelled more than a few pixels swallows the click that
 *    follows it, or throwing the rail by a card would also open that card.
 */

const SNAP_THRESHOLD = 6 // px of travel before a drag counts as a drag
const FRICTION = 0.94 // per frame; 0.94 ≈ a firm mat, not an ice rink

export function DragRail({
  children,
  count,
  label,
  invert = false,
  className = '',
  itemSelector = ':scope > *',
  fade = true,
  align = 'stretch',
}: {
  children: ReactNode
  count: number
  label: string
  invert?: boolean
  className?: string
  itemSelector?: string
  /** Feather the trailing end, so a frame leaves the measure rather than
   *  being cut off square by it. */
  fade?: boolean
  align?: 'stretch' | 'start'
}) {
  const rail = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)

  // Drag bookkeeping lives in a ref: none of it should cause a render.
  const drag = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    startIndex: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    travelled: 0,
    /** +1 when the content was pulled left (moving forward), -1 the other way. */
    dir: 0,
    /** Set on release; the click that follows a drag consumes this flag. */
    swallowClick: false,
    frame: 0,
  })

  const items = useCallback(() => {
    const el = rail.current
    return el ? (Array.from(el.querySelectorAll<HTMLElement>(itemSelector)) as HTMLElement[]) : []
  }, [itemSelector])

  /**
   * Index of the frame closest to the rail's leading edge.
   *
   * Leading edge, not centre: `go()` aligns a frame to the left of the
   * scrollport and the CSS snaps to `snap-start`, so measuring from the centre
   * would pick one frame and land on another.
   */
  const nearest = useCallback(() => {
    const el = rail.current
    if (!el) return 0
    const list = items()
    let best = 0
    let bestDist = Infinity
    list.forEach((node, i) => {
      const left = node.offsetLeft - el.offsetLeft
      const d = Math.abs(left - el.scrollLeft)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    return best
  }, [items])

  const measure = useCallback(() => {
    const el = rail.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setProgress(max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 1)
    setIndex(nearest())
  }, [nearest])

  /** Scroll so that `i` sits at the rail's left edge (or as close as it can). */
  const go = useCallback(
    (i: number, smooth = true) => {
      const el = rail.current
      if (!el) return
      const list = items()
      const target = list[Math.max(0, Math.min(list.length - 1, i))]
      if (!target) return
      el.scrollTo({
        left: target.offsetLeft - el.offsetLeft,
        behavior: smooth ? 'smooth' : 'auto',
      })
    },
    [items],
  )

  // ── Native scroll → index + progress ──────────────────────────────────────
  useEffect(() => {
    const el = rail.current
    if (!el) return
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        measure()
      })
    }
    measure()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [measure])

  // ── Press and drag, with a throw ──────────────────────────────────────────
  useEffect(() => {
    const el = rail.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const d = drag.current

    /**
     * Land on the nearest frame once the throw has run down.
     *
     * Snapping stays OFF until the scroll has actually stopped. Restoring it
     * first hands the moving rail to the browser mid-flight, which yanks it to
     * a different frame — the glitch-then-jump-back.
     */
    const settle = () => {
      const list = items()
      if (!list.length) {
        el.style.scrollSnapType = ''
        return
      }

      // At either end there is no frame left to align to, and forcing one would
      // read as the rail refusing the gesture. Leave it where it is.
      const max = el.scrollWidth - el.clientWidth
      if (el.scrollLeft <= 1 || el.scrollLeft >= max - 1) {
        el.style.scrollSnapType = ''
        setIndex(nearest())
        return
      }

      // Round in the direction the gesture was going, rather than to whichever
      // frame is nearest in absolute terms. Absolute rounding makes a throw
      // that coasts a little past a frame get pulled backwards into it, which
      // is the visible "it jumps and comes back". Going with the gesture, the
      // rail only ever finishes the movement it was already making.
      let best = nearest()
      if (d.dir !== 0) {
        const from = el.scrollLeft
        const lefts = list.map((n) => n.offsetLeft - el.offsetLeft)
        // A frame is "reached" once the rail is within a third of it.
        const slack = (list[best]?.clientWidth ?? 0) / 3
        if (d.dir > 0) {
          const ahead = lefts.findIndex((l) => l > from + slack)
          best = ahead === -1 ? list.length - 1 : ahead
        } else {
          let behind = 0
          lefts.forEach((l, i) => {
            if (l < from - slack) behind = i
          })
          best = behind
        }
        // A deliberate nudge always moves at least one frame.
        if (d.travelled > 24 && best === d.startIndex) {
          best = Math.max(0, Math.min(list.length - 1, d.startIndex + d.dir))
        }
      }
      const target = list[best]
      if (!target) {
        el.style.scrollSnapType = ''
        return
      }
      const left = target.offsetLeft - el.offsetLeft
      // Already there: give snapping straight back.
      if (Math.abs(left - el.scrollLeft) < 2) {
        el.style.scrollSnapType = ''
        return
      }
      el.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' })
      restoreSnapWhenStill()
    }

    /**
     * Give snapping back only once the rail has been still for two frames.
     * `scrollend` is the right event for this but is not everywhere yet, so a
     * position watcher backs it up, with a hard ceiling so the rail can never
     * be left un-snapping.
     */
    let restoreFrame = 0
    let restoreTimer: ReturnType<typeof setTimeout> | undefined
    const restoreSnapWhenStill = () => {
      if (restoreFrame) cancelAnimationFrame(restoreFrame)
      if (restoreTimer) clearTimeout(restoreTimer)
      let last = el.scrollLeft
      let still = 0
      const check = () => {
        const now = el.scrollLeft
        still = Math.abs(now - last) < 0.5 ? still + 1 : 0
        last = now
        if (still >= 2) {
          restoreFrame = 0
          el.style.scrollSnapType = ''
          return
        }
        restoreFrame = requestAnimationFrame(check)
      }
      restoreFrame = requestAnimationFrame(check)
      restoreTimer = setTimeout(() => {
        if (restoreFrame) cancelAnimationFrame(restoreFrame)
        restoreFrame = 0
        el.style.scrollSnapType = ''
      }, 1200)
    }

    const glide = () => {
      d.frame = 0
      d.velocity *= FRICTION
      el.scrollLeft -= d.velocity
      const atEdge =
        el.scrollLeft <= 0 || el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
      if (Math.abs(d.velocity) > 0.45 && !atEdge) {
        d.frame = requestAnimationFrame(glide)
        return
      }
      if (atEdge) {
        // Arrived at the end under its own momentum: nothing to correct, and a
        // correction here would look like the rail rebounding.
        d.velocity = 0
        el.style.scrollSnapType = ''
        setIndex(nearest())
        return
      }
      settle()
    }

    const onDown = (e: PointerEvent) => {
      // Touch and pen already have native panning; only the mouse needs this.
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      if (d.frame) cancelAnimationFrame(d.frame)
      d.active = true
      d.startX = e.clientX
      d.lastX = e.clientX
      d.lastT = e.timeStamp
      d.startScroll = el.scrollLeft
      d.startIndex = nearest()
      d.velocity = 0
      d.travelled = 0
      d.dir = 0
      // Snapping has to be off while scrollLeft is written by hand, or the
      // browser pulls against every frame of the drag.
      el.style.scrollSnapType = 'none'
      setDragging(true)
      el.setPointerCapture(e.pointerId)
    }

    const onMove = (e: PointerEvent) => {
      if (!d.active) return
      const dx = e.clientX - d.startX
      d.travelled = Math.max(d.travelled, Math.abs(dx))
      if (Math.abs(dx) > 6) d.dir = dx < 0 ? 1 : -1
      el.scrollLeft = d.startScroll - dx
      const dt = e.timeStamp - d.lastT
      if (dt > 0) {
        // Clamped: a sub-millisecond gap between two moves otherwise produces a
        // velocity of hundreds of px per frame and the rail is flung off the end.
        const v = ((e.clientX - d.lastX) / dt) * 16
        d.velocity = Math.max(-58, Math.min(58, v))
      }
      d.lastX = e.clientX
      d.lastT = e.timeStamp
      e.preventDefault()
    }

    const onUp = (e: PointerEvent) => {
      if (!d.active) return
      d.active = false
      setDragging(false)
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      d.swallowClick = d.travelled > SNAP_THRESHOLD
      if (reduce || Math.abs(d.velocity) < 1.2) settle()
      else d.frame = requestAnimationFrame(glide)
    }

    /**
     * A throw must not also count as a click on the card it started from.
     *
     * This consumes its own flag and leaves `travelled` alone. Clearing
     * `travelled` here was a real bug: the click fires immediately after
     * pointerup, before the first frame of the glide, so it wiped the very
     * measurement `settle()` reads to decide whether the gesture meant to
     * advance — and every mouse drag fell back to springing into place.
     */
    const onClick = (e: MouseEvent) => {
      if (!d.swallowClick) return
      d.swallowClick = false
      e.preventDefault()
      e.stopPropagation()
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('click', onClick, true)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('click', onClick, true)
      if (d.frame) cancelAnimationFrame(d.frame)
      if (restoreFrame) cancelAnimationFrame(restoreFrame)
      if (restoreTimer) clearTimeout(restoreTimer)
      el.style.scrollSnapType = ''
    }
  }, [items, nearest])

  const atStart = progress <= 0.001
  const atEnd = progress >= 0.999
  const arrow = invert
    ? 'border-white/25 text-white hover:bg-white hover:text-ink [--icon-accent:currentColor]'
    : 'border-rule text-ink hover:bg-ink hover:text-shell [--icon-accent:currentColor]'

  return (
    <div className={className}>
      <div
        ref={rail}
        role="group"
        aria-label={`${label}, drag or use the arrows`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1) }
        }}
        className={`rail flex snap-x gap-3 overflow-x-auto pb-1 md:gap-4 ${
          align === 'start' ? 'items-start' : ''
        } ${fade ? 'fade-x-end' : ''} ${dragging ? 'is-dragging' : ''}`}
      >
        {children}
      </div>

      <div className="mt-6 flex items-center gap-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={atStart}
            aria-label="Previous"
            className={`flex h-11 w-11 items-center justify-center border transition-colors duration-200 disabled:opacity-25 ${arrow}`}
          >
            <Icon name="arrow" size={18} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={atEnd}
            aria-label="Next"
            className={`flex h-11 w-11 items-center justify-center border transition-colors duration-200 disabled:opacity-25 ${arrow}`}
          >
            <Icon name="arrow" size={18} />
          </button>
        </div>

        {/* One continuous bar: this rail scrolls freely, so a segmented rule
            would imply discrete stops it does not have. */}
        <div className={`h-[3px] flex-1 ${invert ? 'bg-white/15' : 'bg-rule'}`}>
          <div
            className="h-full bg-red transition-[width] duration-200 ease-out"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>

        <span className={`label-sm nums shrink-0 ${invert ? 'text-white/45' : 'text-muted'}`}>
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
