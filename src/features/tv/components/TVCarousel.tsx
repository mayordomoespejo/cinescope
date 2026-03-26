import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { TVShow } from '../types/tv'
import TVCard from './TVCard'
import { SkeletonGrid } from '@/features/movies/components/SkeletonCard'
import styles from './TVCarousel.module.css'

interface TVCarouselProps {
  title: string
  shows: TVShow[]
  isLoading: boolean
  /** @deprecated Navigation is handled internally by TVCard. This prop is kept for API compatibility. */
  onOpenShow?: (id: number) => void
  onPrefetch?: (id: number) => void
}

export default function TVCarousel({
  title,
  shows,
  isLoading,
  onOpenShow = () => {},
  onPrefetch,
}: TVCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const THRESHOLD = 2 // px — subpixel tolerance

  const updateBounds = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= THRESHOLD)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - THRESHOLD)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className={styles.section} aria-labelledby={`tv-carousel-${title}`}>
      <div className={styles.header}>
        <h2 className={styles.title} id={`tv-carousel-${title}`}>
          {title}
        </h2>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scroll('left')}
            disabled={atStart}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scroll('right')}
            disabled={atEnd}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.trackWrapper}>
        <div
          className={styles.track}
          ref={scrollRef}
          role="list"
          aria-label={title}
          onScroll={updateBounds}
        >
          {isLoading ? (
            <div className={styles.skeletonRow}>
              <SkeletonGrid count={8} />
            </div>
          ) : (
            shows.map((show, i) => (
              <motion.div
                key={show.id}
                className={styles.item}
                role="listitem"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onAnimationComplete={i === 0 ? updateBounds : undefined}
              >
                <TVCard show={show} onOpen={onOpenShow} onPrefetch={onPrefetch} />
              </motion.div>
            ))
          )}
        </div>
        <div className={styles.fadeLeft} aria-hidden="true" />
        <div className={styles.fadeRight} aria-hidden="true" />
      </div>
    </section>
  )
}
