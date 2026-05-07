import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SkeletonCard from '@/components/ui/SkeletonCard'
import Button from '@/components/ui/Button'
import { mediaGridContainer } from './mediaGridVariants'
import styles from './MediaGrid.module.css'

/** Props for the MediaGrid component. */
export interface MediaGridProps {
  /** Card elements to render inside the grid — MovieCard, TVCard, etc. */
  children: ReactNode
  /** When true, renders skeleton placeholders instead of children. */
  isLoading: boolean
  /** When true (and not loading), renders the empty state message. */
  isEmpty: boolean
  /** Custom text shown in the empty state. Defaults to "No results found". */
  emptyMessage?: string
  /** When true, the "Load more" button is visible. */
  hasMore?: boolean
  /** Callback fired when the user clicks "Load more". */
  onLoadMore?: () => void
  /** When true, the "Load more" button shows a loading spinner. */
  loadingMore?: boolean
  /** Number of skeleton cards to render while loading. Defaults to 12. */
  skeletonCount?: number
  /** Optional extra CSS class applied to the grid wrapper div. */
  className?: string
  /** Accessible label for the grid list element. Defaults to "Media". */
  ariaLabel?: string
  /** Icon shown above the empty state message. Defaults to "🎬". */
  emptyIcon?: string
  /** When true, adds inline skeleton cards at the end of the grid (pagination skeleton). */
  isFetchingMore?: boolean
  /** Number of skeleton cards appended during pagination. Defaults to 4. */
  fetchingMoreCount?: number
  /** Error to display instead of the grid. */
  error?: Error | null
}

/**
 * @description Shared animated responsive grid with loading skeletons, error state, empty state,
 * and a "Load more" button. Accepts arbitrary card children so it works for movies, TV shows,
 * or any other media type.
 * @param props - Component props
 */
export default function MediaGrid({
  children,
  isLoading,
  isEmpty,
  emptyMessage = 'No results found',
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  skeletonCount = 12,
  className,
  ariaLabel = 'Media',
  emptyIcon = '🎬',
  isFetchingMore = false,
  fetchingMoreCount = 4,
  error,
}: MediaGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const gridClass = className ? `${styles.grid} ${className}` : styles.grid

  if (error) {
    return (
      <div className={styles.state} role="alert">
        <span className={styles.stateIcon}>⚠️</span>
        <p className={styles.stateText}>Something went wrong</p>
        <p className={styles.stateSubtext}>{error.message}</p>
        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={gridClass} aria-busy="true" aria-label={`Loading ${ariaLabel}`}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className={styles.state}>
        <span className={styles.stateIcon}>{emptyIcon}</span>
        <p className={styles.stateText}>{emptyMessage}</p>
      </div>
    )
  }

  const handleLoadMore = () => {
    const section = wrapperRef.current?.closest('section') ?? wrapperRef.current
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - 64
      window.scrollTo({ top, behavior: 'smooth' })
    }
    onLoadMore?.()
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <motion.div
        className={gridClass}
        variants={mediaGridContainer}
        initial="hidden"
        animate="show"
        role="list"
        aria-label={ariaLabel}
      >
        <AnimatePresence>{children}</AnimatePresence>
        {isFetchingMore &&
          Array.from({ length: fetchingMoreCount }, (_, i) => (
            <SkeletonCard key={`fetching-${i}`} />
          ))}
      </motion.div>

      {hasMore && onLoadMore && !isFetchingMore && (
        <div className={styles.loadMore}>
          <Button variant="secondary" size="lg" onClick={handleLoadMore} loading={loadingMore}>
            Discover more
          </Button>
        </div>
      )}
    </div>
  )
}
