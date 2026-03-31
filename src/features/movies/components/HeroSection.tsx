import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Movie } from '../types/movie'
import { getBackdropUrl, formatRating, getReleaseYear } from '@/lib/helpers'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import styles from './HeroSection.module.css'

/** Props for the HeroSection component. */
interface HeroSectionProps {
  movie: Movie | undefined
  isLoading: boolean
  onOpenMovie: (id: number) => void
}

/**
 * @description Full-width hero banner displaying a featured movie with backdrop image, metadata, and action buttons.
 * @param props - Component props
 */
export default function HeroSection({ movie, isLoading, onOpenMovie }: HeroSectionProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  if (isLoading) {
    return (
      <div className={styles.heroSkeleton} aria-busy="true">
        <div className={styles.heroSkeletonContent}>
          <Skeleton height="2.5rem" width="60%" />
          <Skeleton height="1rem" width="30%" />
          <Skeleton height="0.875rem" width="80%" />
          <Skeleton height="0.875rem" width="70%" />
          <div className={styles.heroSkeletonButtons}>
            <Skeleton height="44px" width="140px" borderRadius="var(--radius-md)" />
            <Skeleton height="44px" width="140px" borderRadius="var(--radius-md)" />
          </div>
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <motion.section
      className={styles.hero}
      aria-label={`Featured movie: ${movie.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Backdrop */}
      <div className={styles.backdropWrapper}>
        {!imgLoaded && <div className={styles.backdropPlaceholder} aria-hidden="true" />}
        <img
          src={getBackdropUrl(movie.backdrop_path, 'lg')}
          alt=""
          className={`${styles.backdrop} ${imgLoaded ? styles.backdropLoaded : ''}`}
          loading="eager"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
        />
        <div className={styles.backdropOverlay} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <motion.div
          className={styles.info}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.meta}>
            <span className={styles.rating}>
              <span aria-hidden="true">★</span> {formatRating(movie.vote_average)}
            </span>
            <span className={styles.year}>{getReleaseYear(movie.release_date)}</span>
            <span className={styles.badge}>Trending</span>
          </div>

          <h1 className={styles.title}>{movie.title}</h1>

          <p className={styles.overview}>{movie.overview}</p>

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onOpenMovie(movie.id)}
              aria-label={`View details for ${movie.title}`}
            >
              <span aria-hidden="true">▶</span> View Details
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
