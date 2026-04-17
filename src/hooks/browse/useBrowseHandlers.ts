import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOutletContext } from '@/components/ui/LayoutContext'
import { useMoviePrefetch } from '@/features/movies/hooks/useMoviePrefetch'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import type { LayoutContext } from '@/components/ui/LayoutContext'
import type { TVShow } from '@/features/tv/types/tv'
import type { Movie } from '@/features/movies/types/movie'

export interface BrowseHandlersState {
  favoriteIds: number[]
  onOpenMovie: (id: number) => void
  onOpenShow: (id: number) => void
  onPrefetch: (id: number) => void
  onToggleFavorite: (item: Movie | TVShow) => void
}

/**
 * Provides stable action handlers for the Browse page:
 * opening a movie modal, navigating to a TV show detail page,
 * prefetching movie data on hover, and toggling favorites.
 */
export function useBrowseHandlers(): BrowseHandlersState {
  const { onOpenMovie } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
  const { prefetchMovieData } = useMoviePrefetch()
  const { favorites, toggleFavorite } = useFavorites()

  const favoriteIds = useMemo(() => favorites.map(f => f.id), [favorites])

  const handleOpenMovie = useCallback((id: number) => { onOpenMovie(id) }, [onOpenMovie])

  const handleOpenShow = useCallback((id: number) => { navigate(`/tv/${id}`) }, [navigate])

  const handleToggleFavorite = useCallback(
    (item: Movie | TVShow) => { void toggleFavorite(item as Movie) },
    [toggleFavorite]
  )

  return {
    favoriteIds,
    onOpenMovie: handleOpenMovie,
    onOpenShow: handleOpenShow,
    onPrefetch: prefetchMovieData,
    onToggleFavorite: handleToggleFavorite,
  }
}
