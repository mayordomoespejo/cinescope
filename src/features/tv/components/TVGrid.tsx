import { motion } from 'framer-motion'
import type { TVShow } from '../types/tv'
import TVCard from './TVCard'
import MediaGrid from '@/components/ui/MediaGrid'
import { mediaGridItem } from '@/components/ui/mediaGridVariants'

/** Props for the TVGrid component. */
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

/**
 * @description Animated responsive grid of TVCard items. Delegates layout, skeletons,
 * empty state, and load-more behaviour to the shared MediaGrid component.
 * @param props - Component props
 */
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
  return (
    <MediaGrid
      isLoading={isLoading}
      isEmpty={shows.length === 0}
      emptyMessage={emptyMessage ?? 'No TV shows found.'}
      emptyIcon="📺"
      hasMore={hasNextPage}
      onLoadMore={onLoadMore}
      isFetchingMore={isFetchingNextPage}
      fetchingMoreCount={4}
      skeletonCount={20}
      ariaLabel="TV Shows"
      error={error}
    >
      {shows.map(show => (
        <motion.div key={show.id} variants={mediaGridItem} exit="exit" role="listitem">
          <TVCard show={show} onOpen={onOpenShow} onPrefetch={onPrefetch} />
        </motion.div>
      ))}
    </MediaGrid>
  )
}
