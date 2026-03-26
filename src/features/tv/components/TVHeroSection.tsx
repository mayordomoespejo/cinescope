import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TVShow } from '../types/tv'
import { getBackdropUrl, formatRating, getReleaseYear } from '@/lib/helpers'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import styles from './TVHeroSection.module.css'

interface TVHeroSectionProps {
  show: TVShow | undefined
  isLoading: boolean
  onOpenShow: (id: number) => void
}

export default function TVHeroSection({ show, isLoading, onOpenShow }: TVHeroSectionProps) {
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
          </div>
        </div>
      </div>
    )
  }

  if (!show) return null

  return (
    <motion.section
      className={styles.hero}
      aria-label={`Featured TV show: ${show.name}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Backdrop */}
      <div className={styles.backdropWrapper}>
        {!imgLoaded && <div className={styles.backdropPlaceholder} aria-hidden="true" />}
        <img
          src={getBackdropUrl(show.backdrop_path, 'lg')}
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
              <span aria-hidden="true">★</span> {formatRating(show.vote_average)}
            </span>
            <span className={styles.year}>{getReleaseYear(show.first_air_date)}</span>
            <span className={styles.badge}>Trending</span>
          </div>

          <h1 className={styles.title}>{show.name}</h1>

          <p className={styles.overview}>{show.overview}</p>

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onOpenShow(show.id)}
              aria-label={`View details for ${show.name}`}
            >
              <span aria-hidden="true">▶</span> View Details
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}
