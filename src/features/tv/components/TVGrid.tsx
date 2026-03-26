import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TVShow } from '../types/tv'
import TVCard from './TVCard'
import { SkeletonGrid } from '@/features/movies/components/SkeletonCard'
import styles from './TVGrid.module.css'
import Button from '@/components/ui/Button'

interface TVGridProps {
  shows: TVShow[]
  isLoading: boolean
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  error?: Error | null
  onOpenShow: (id: number) => void
  onPrefetch?: (id: number) => void
  onLoadMore?: () => void
  emptyMessage?: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export default function TVGrid({
  shows,
  isLoading,
  isFetchingNextPage = false,
  hasNextPage = false,
  error,
  onOpenShow,
  onPrefetch,
  onLoadMore,
  emptyMessage,
}: TVGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

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
      <div className={styles.grid} aria-busy="true" aria-label="Loading TV shows">
        <SkeletonGrid count={20} />
      </div>
    )
  }

  if (shows.length === 0) {
    return (
      <div className={styles.state}>
        <span className={styles.stateIcon}>📺</span>
        <p className={styles.stateText}>{emptyMessage ?? 'No TV shows found.'}</p>
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
        className={styles.grid}
        variants={container}
        initial="hidden"
        animate="show"
        role="list"
        aria-label="TV Shows"
      >
        <AnimatePresence>
          {shows.map(show => (
            <motion.div key={show.id} variants={item} exit="exit" role="listitem">
              <TVCard show={show} onOpen={onOpenShow} onPrefetch={onPrefetch} />
            </motion.div>
          ))}
        </AnimatePresence>
        {isFetchingNextPage && <SkeletonGrid count={4} />}
      </motion.div>

      {hasNextPage && onLoadMore && !isFetchingNextPage && (
        <div className={styles.loadMore}>
          <Button variant="secondary" size="lg" onClick={handleLoadMore}>
            Discover more
          </Button>
        </div>
      )}
    </div>
  )
}
