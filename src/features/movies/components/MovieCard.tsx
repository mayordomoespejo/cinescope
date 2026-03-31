import type { Movie } from '../types/movie'
import { formatRating, getReleaseYear } from '@/lib/helpers'
import MediaCard from '@/components/ui/MediaCard'

/** Props for the MovieCard component. */
interface MovieCardProps {
  movie: Movie
  onOpen: (id: number) => void
  onPrefetch?: (id: number) => void
  isFavorite?: boolean
  onToggleFavorite?: (movie: Movie) => void
  dragHandle?: React.ReactNode
}

/**
 * @description Displays a movie poster card with rating badge, favorite toggle, and hover overlay.
 * Triggers prefetch on hover/focus. Delegates all visual rendering to MediaCard.
 * @param props - Component props
 */
export default function MovieCard({
  movie,
  onOpen,
  onPrefetch,
  isFavorite = false,
  onToggleFavorite,
  dragHandle,
}: MovieCardProps) {
  return (
    <MediaCard
      title={movie.title}
      year={getReleaseYear(movie.release_date)}
      posterPath={movie.poster_path}
      rating={movie.vote_average}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(movie) : undefined}
      onClick={() => onOpen(movie.id)}
      onPrefetch={onPrefetch ? () => onPrefetch(movie.id) : undefined}
      ariaLabel={`${movie.title}, ${getReleaseYear(movie.release_date)}, rating ${formatRating(movie.vote_average)}`}
      dragHandle={dragHandle}
    />
  )
}
