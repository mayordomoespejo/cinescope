import type { TVShow } from '../types/tv'
import { formatRating, getReleaseYear } from '@/lib/helpers'
import MediaCard from '@/components/ui/MediaCard'

/** Props for the TVCard component. */
interface TVCardProps {
  show: TVShow
  /** Called when the card is clicked. The caller is responsible for navigation. */
  onOpen: (id: number) => void
  onPrefetch?: (id: number) => void
  isFavorite?: boolean
  onToggleFavorite?: (show: TVShow) => void
}

/**
 * @description Displays a TV show poster card with rating badge and favourite toggle.
 * Triggers prefetch on hover/focus. Delegates all visual rendering to MediaCard.
 * Navigation is handled by the caller via the `onOpen` prop.
 * @param props - Component props
 */
export default function TVCard({
  show,
  onOpen,
  onPrefetch,
  isFavorite = false,
  onToggleFavorite,
}: TVCardProps) {
  return (
    <MediaCard
      title={show.name}
      year={getReleaseYear(show.first_air_date)}
      posterPath={show.poster_path}
      rating={show.vote_average}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(show) : undefined}
      onClick={() => onOpen(show.id)}
      onPrefetch={onPrefetch ? () => onPrefetch(show.id) : undefined}
      ariaLabel={`${show.name}, ${getReleaseYear(show.first_air_date)}, rating ${formatRating(show.vote_average)}`}
    />
  )
}
