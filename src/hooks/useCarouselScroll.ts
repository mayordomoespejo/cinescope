import { useRef, useState, useCallback } from 'react'

/** Subpixel tolerance used when detecting scroll boundary. */
const THRESHOLD = 2

/**
 * Encapsulates all horizontal scroll state and logic for a carousel track element.
 *
 * @returns `trackRef` — attach to the scrollable `<div>`.
 * @returns `canScrollLeft` — true when the track is not at its left edge.
 * @returns `canScrollRight` — true when the track is not at its right edge.
 * @returns `scroll` — call with `'left'` or `'right'` to scroll by 75% of the visible width.
 *
 * @example
 * ```tsx
 * const { trackRef, canScrollLeft, canScrollRight, scroll } = useCarouselScroll()
 *
 * return (
 *   <>
 *     <button disabled={!canScrollLeft} onClick={() => scroll('left')}>←</button>
 *     <div ref={trackRef} onScroll={updateBounds}>...</div>
 *     <button disabled={!canScrollRight} onClick={() => scroll('right')}>→</button>
 *   </>
 * )
 * ```
 */
export function useCarouselScroll() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  /** Recomputes boundary flags from the current scroll position. */
  const updateBounds = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > THRESHOLD)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - THRESHOLD)
  }, [])

  /** Scrolls the track by 75% of its visible width in the given direction. */
  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }, [])

  return { trackRef, canScrollLeft, canScrollRight, scroll, updateBounds }
}
