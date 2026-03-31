import { motion } from 'framer-motion'
import type { Movie } from '../types/movie'
import MovieCard from './MovieCard'
import MediaGrid from '@/components/ui/MediaGrid'
import { mediaGridItem } from '@/components/ui/mediaGridVariants'

/** Props for the MovieGrid component. */
interface MovieGridProps {
  movies: Movie[]
  isLoading: boolean
  isFetchingNextPage?: boolean
  hasNextPage?: boolean
  error?: Error | null
  onOpenMovie: (id: number) => void
  onPrefetch?: (id: number) => void
  onLoadMore?: () => void
  favorites?: number[]
  onToggleFavorite?: (movie: Movie) => void
  emptyMessage?: string
}

/**
 * @description Animated responsive grid of MovieCard items. Delegates layout, skeletons,
 * empty state, and load-more behaviour to the shared MediaGrid component.
 * @param props - Component props
 */
export default function MovieGrid({
  movies,
  isLoading,
  isFetchingNextPage = false,
  hasNextPage = false,
  error,
  onOpenMovie,
  onPrefetch,
  onLoadMore,
  favorites = [],
  onToggleFavorite,
  emptyMessage,
}: MovieGridProps) {
  return (
    <MediaGrid
      isLoading={isLoading}
      isEmpty={movies.length === 0}
      emptyMessage={emptyMessage ?? 'No movies found.'}
      emptyIcon="🎬"
      hasMore={hasNextPage}
      onLoadMore={onLoadMore}
      isFetchingMore={isFetchingNextPage}
      fetchingMoreCount={4}
      skeletonCount={20}
      ariaLabel="Movies"
      error={error}
    >
      {movies.map(movie => (
        <motion.div key={movie.id} variants={mediaGridItem} exit="exit" role="listitem">
          <MovieCard
            movie={movie}
            onOpen={onOpenMovie}
            onPrefetch={onPrefetch}
            isFavorite={favorites.includes(movie.id)}
            onToggleFavorite={onToggleFavorite}
          />
        </motion.div>
      ))}
    </MediaGrid>
  )
}
