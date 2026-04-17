import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useOutletContext } from '@/components/ui/LayoutContext'
import { useSearchMovies } from '@/features/movies/hooks/useSearch'
import { useMoviePrefetch } from '@/features/movies/hooks/useMoviePrefetch'
import { useSearchTV } from '@/features/tv/hooks/useSearchTV'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { addSearchQuery } from '@/features/search/searchHistoryStore'
import MovieBrowseSection from '@/features/movies/components/MovieBrowseSection'
import TVBrowseSection from '@/features/tv/components/TVBrowseSection'
import SearchResults from '@/features/search/components/SearchResults'
import { tvShowToMovie } from '@/features/tv/adapters'
import type { LayoutContext } from '@/components/ui/LayoutContext'
import type { TVShow } from '@/features/tv/types/tv'

/** Props for the BrowsePage component. */
export interface BrowsePageProps {
  /** Determines which media domain (movies or TV shows) this page renders. */
  mediaType: 'movie' | 'tv'
}

/**
 * Thin coordinator page for movie and TV browsing.
 * Both MovieBrowseSection and TVBrowseSection own their own filter/data state.
 * BrowsePage only manages search-mode state.
 */
export default function BrowsePage({ mediaType }: BrowsePageProps) {
  const { onOpenMovie } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''

  // ── Shared ────────────────────────────────────────────────────────────────
  const { prefetchMovieData } = useMoviePrefetch()
  const { favorites, toggleFavorite } = useFavorites()

  // ── Movie search (only for search mode) ──────────────────────────────────
  const {
    data: movieSearchData,
    isLoading: movieSearchLoading,
    error: movieSearchError,
  } = useSearchMovies(mediaType === 'movie' ? searchQuery : '')

  // ── TV search (only for search mode) ─────────────────────────────────────
  const {
    data: tvSearchData,
    isLoading: tvSearchLoading,
    error: tvSearchError,
  } = useSearchTV(mediaType === 'tv' ? searchQuery : '')

  useEffect(() => {
    if (searchQuery) addSearchQuery(searchQuery)
  }, [searchQuery])

  // ── Derived values ────────────────────────────────────────────────────────
  const favoriteIds = favorites.map(f => f.id)

  const searchMovies = movieSearchData?.results ?? []
  const searchShows = tvSearchData?.results ?? []

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenMovie = (id: number) => {
    onOpenMovie(id)
  }
  const handleOpenShow = (id: number) => {
    navigate(`/tv/${id}`)
  }

  const handleToggleFavoriteTV = (show: TVShow) => {
    void toggleFavorite(tvShowToMovie(show))
  }

  // ── Search mode ───────────────────────────────────────────────────────────
  if (searchQuery) {
    return (
      <SearchResults
        mediaType={mediaType}
        searchQuery={searchQuery}
        searchMovies={searchMovies}
        movieSearchLoading={movieSearchLoading}
        movieSearchError={movieSearchError}
        movieTotalResults={movieSearchData?.total_results}
        searchShows={searchShows}
        tvSearchLoading={tvSearchLoading}
        tvSearchError={tvSearchError}
        tvTotalResults={tvSearchData?.total_results}
        favoriteIds={favoriteIds}
        onOpenMovie={handleOpenMovie}
        onPrefetch={prefetchMovieData}
        onToggleFavorite={toggleFavorite}
        onOpenShow={handleOpenShow}
        onToggleFavoriteTV={handleToggleFavoriteTV}
      />
    )
  }

  // ── Normal browse mode ────────────────────────────────────────────────────
  if (mediaType === 'movie') {
    return <MovieBrowseSection />
  }

  return <TVBrowseSection />
}
