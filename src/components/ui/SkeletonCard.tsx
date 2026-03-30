import Skeleton from './Skeleton'
import styles from './SkeletonCard.module.css'

/** Props for the SkeletonCard component. */
interface SkeletonCardProps {
  /** Optional extra CSS class applied to the card wrapper. */
  className?: string
}

/**
 * @description Poster-style skeleton card (2/3 aspect ratio) for use in
 * favorites, watchlist, and watched card grids while data is loading.
 * Reuses the Skeleton primitive for the shimmer animation.
 */
export default function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`${styles.card} ${className}`} aria-hidden="true">
      <Skeleton height="100%" borderRadius="var(--radius-lg)" className={styles.poster} />
      <div className={styles.info}>
        <Skeleton height="0.85rem" width="80%" />
        <Skeleton height="0.75rem" width="50%" />
      </div>
    </div>
  )
}

/** Props for the SkeletonCardGrid component. */
interface SkeletonCardGridProps {
  /** Number of skeleton cards to render. Defaults to 6. */
  count?: number
  /** Optional extra CSS class applied to the grid wrapper. */
  className?: string
}

/**
 * @description Grid of SkeletonCard placeholders. Matches the movie/TV poster
 * grid layout (auto-fill, minmax 150px → 185px). Use while favorites,
 * watchlist, or watched list data is loading.
 */
export function SkeletonCardGrid({ count = 6, className = '' }: SkeletonCardGridProps) {
  return (
    <div
      className={`${styles.grid} ${className}`}
      aria-busy="true"
      aria-label="Loading cards"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
