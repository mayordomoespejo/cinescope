import SkeletonCard from './SkeletonCard'
import styles from './SkeletonGrid.module.css'

/** Props for the SkeletonGrid component. */
export interface SkeletonGridProps {
  /** Number of skeleton cards to render. Defaults to 6. */
  count?: number
  /** Optional extra CSS class applied to the grid wrapper. */
  className?: string
}

/**
 * @description Grid of SkeletonCard placeholders. Matches the movie/TV poster
 * grid layout (auto-fill, minmax 150px → 185px). Use while favorites,
 * watchlist, watched list, or browse data is loading.
 */
export default function SkeletonGrid({ count = 6, className = '' }: SkeletonGridProps) {
  return (
    <div className={`${styles.grid} ${className}`} aria-busy="true" aria-label="Loading cards">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
