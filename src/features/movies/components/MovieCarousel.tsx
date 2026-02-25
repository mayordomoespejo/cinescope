import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { Movie } from '../types/movie'
import MovieCard from './MovieCard'
import { SkeletonGrid } from './SkeletonCard'
import styles from './MovieCarousel.module.css'

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

export default function MovieCarousel({
  title,
  movies,
  isLoading,
  onOpenMovie,
  onPrefetch,
  favorites = [],
  onToggleFavorite,
}: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const THRESHOLD = 2 // px — tolerancia subpíxeles

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
