import SkeletonBlock from './SkeletonBlock'
import styles from './SkeletonCard.module.css'

/** Props for the SkeletonCard component. */
export interface SkeletonCardProps {
  /** Optional extra CSS class applied to the card wrapper. */
  className?: string
}

/**
 * @description Poster-style skeleton card (2/3 aspect ratio) for use in
 * favorites, watchlist, watched, and browse grids while data is loading.
 * Reuses SkeletonBlock for the shimmer animation.
 */
export default function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`${styles.card} ${className}`} aria-hidden="true">
      <SkeletonBlock height="100%" borderRadius="var(--radius-lg)" className={styles.poster} />
      <div className={styles.info}>
        <SkeletonBlock height="0.85rem" width="80%" />
        <SkeletonBlock height="0.75rem" width="50%" />
      </div>
    </div>
  )
}
