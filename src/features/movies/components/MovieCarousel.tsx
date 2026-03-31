import { motion } from 'framer-motion'
import type { Movie } from '../types/movie'
import MovieCard from './MovieCard'
import { SkeletonGrid } from './SkeletonCard'
import { useCarouselScroll } from '@/hooks/useCarouselScroll'
import styles from './MovieCarousel.module.css'

/** Props for the MovieCarousel component. */
interface MovieCarouselProps {
  title: string
  movies: Movie[]
  isLoading: boolean
  onOpenMovie: (id: number) => void
  onPrefetch?: (id: number) => void
  favorites?: number[]
  onToggleFavorite?: (movie: Movie) => void
  viewAllHref?: string
}

/**
 * @description Horizontally scrollable carousel of MovieCard items with animated arrow navigation and skeleton loaders.
 * @param props - Component props
 */
export default function MovieCarousel({
  title,
  movies,
  isLoading,
  onOpenMovie,
  onPrefetch,
  favorites = [],
  onToggleFavorite,
}: MovieCarouselProps) {
  const { trackRef, canScrollLeft, canScrollRight, scroll, updateBounds } = useCarouselScroll()

  return (
    <section className={styles.section} aria-labelledby={`carousel-${title}`}>
      <div className={styles.header}>
        <h2 className={styles.title} id={`carousel-${title}`}>
          {title}
        </h2>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M6.5 1.5 3 5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M3.5 1.5 7 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div className={styles.trackWrapper}>
        <div
          className={styles.track}
          ref={trackRef}
          role="list"
          aria-label={title}
          onScroll={updateBounds}
        >
          {isLoading ? (
            <div className={styles.skeletonRow}>
              <SkeletonGrid count={8} />
            </div>
          ) : (
            movies.map((movie, i) => (
              <motion.div
                key={movie.id}
                className={styles.item}
                role="listitem"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onAnimationComplete={i === 0 ? updateBounds : undefined}
              >
                <MovieCard
                  movie={movie}
                  onOpen={onOpenMovie}
                  onPrefetch={onPrefetch}
                  isFavorite={favorites.includes(movie.id)}
                  onToggleFavorite={onToggleFavorite}
                />
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
