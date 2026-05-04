import { useBrowseFilters } from '@/hooks/browse/useBrowseFilters'
import { useMovieData } from '@/hooks/browse/useMovieData'
import { useTVData } from '@/hooks/browse/useTVData'
import { useBrowseHandlers } from '@/hooks/browse/useBrowseHandlers'
import type { SortOption } from '@/lib/config'
import type { TVShow } from '@/features/tv/types/tv'
import type { Movie } from '@/features/movies/types/movie'
import type { FilterState } from '@/features/filters/types'

export interface BrowseMediaState {
  // Search
  searchQuery: string
  // Filters
  filters: FilterState
  // Favorites
  favoriteIds: number[]
  // Movie data
  trendingMovies: Movie[]
  topRatedMovies: Movie[]
  discoverMovies: Movie[]
  searchMovies: Movie[]
  featuredMovie: Movie | undefined
  movieTrendingLoading: boolean
  movieTopRatedLoading: boolean
  movieDiscoverLoading: boolean
  movieSearchLoading: boolean
  movieDiscoverError: Error | null
  movieSearchError: Error | null
  hasNextMovieDiscover: boolean
  totalMovieSearchResults: number | undefined
  // TV data
  trendingShows: TVShow[]
  topRatedShows: TVShow[]
  discoverShows: TVShow[]
  searchShows: TVShow[]
  featuredShow: TVShow | undefined
  tvTrendingLoading: boolean
  tvTopRatedLoading: boolean
  tvDiscoverLoading: boolean
  tvSearchLoading: boolean
  tvDiscoverError: Error | null
  tvSearchError: Error | null
  hasNextTVDiscover: boolean
  totalTVSearchResults: number | undefined
  tvGenres: { id: number; name: string }[]
  tvGenresLoading: boolean
  tvGenresError: boolean
  // Handlers
  onOpenMovie: (id: number) => void
  onOpenShow: (id: number) => void
  onPrefetch: (id: number) => void
  onToggleFavorite: (item: Movie | TVShow) => void
  onGenreSelect: (id: number | null) => void
  onSortChange: (value: SortOption) => void
  onMinRatingChange: (value: number) => void
  onYearChange: (value: number | undefined) => void
  onLanguageChange: (value: string) => void
  onLoadMore: () => void
}

/**
 * Thin orchestrator that composes focused sub-hooks into the flat
 * `BrowseMediaState` interface consumed by BrowsePage.
 *
 * @param mediaType - Which media domain is currently active.
 */
export function useBrowseMedia(mediaType: 'movie' | 'tv'): BrowseMediaState {
  const filtersState = useBrowseFilters()
  const movieData = useMovieData(mediaType, filtersState.filters)
  const tvData = useTVData(mediaType, filtersState.filters)
  const handlers = useBrowseHandlers()

  return {
    searchQuery: movieData.searchQuery,
    filters: filtersState.filters,
    favoriteIds: handlers.favoriteIds,
    // Movies
    trendingMovies: movieData.trendingMovies,
    topRatedMovies: movieData.topRatedMovies,
    discoverMovies: movieData.discoverMovies,
    searchMovies: movieData.searchMovies,
    featuredMovie: movieData.featuredMovie,
    movieTrendingLoading: movieData.movieTrendingLoading,
    movieTopRatedLoading: movieData.movieTopRatedLoading,
    movieDiscoverLoading: movieData.movieDiscoverLoading,
    movieSearchLoading: movieData.movieSearchLoading,
    movieDiscoverError: movieData.movieDiscoverError,
    movieSearchError: movieData.movieSearchError,
    hasNextMovieDiscover: movieData.hasNextMovieDiscover,
    totalMovieSearchResults: movieData.totalMovieSearchResults,
    // TV
    trendingShows: tvData.trendingShows,
    topRatedShows: tvData.topRatedShows,
    discoverShows: tvData.discoverShows,
    searchShows: tvData.searchShows,
    featuredShow: tvData.featuredShow,
    tvTrendingLoading: tvData.tvTrendingLoading,
    tvTopRatedLoading: tvData.tvTopRatedLoading,
    tvDiscoverLoading: tvData.tvDiscoverLoading,
    tvSearchLoading: tvData.tvSearchLoading,
    tvDiscoverError: tvData.tvDiscoverError,
    tvSearchError: tvData.tvSearchError,
    hasNextTVDiscover: tvData.hasNextTVDiscover,
    totalTVSearchResults: tvData.totalTVSearchResults,
    tvGenres: tvData.tvGenres,
    tvGenresLoading: tvData.tvGenresLoading,
    tvGenresError: tvData.tvGenresError,
    // Handlers
    onOpenMovie: handlers.onOpenMovie,
    onOpenShow: handlers.onOpenShow,
    onPrefetch: handlers.onPrefetch,
    onToggleFavorite: handlers.onToggleFavorite,
    onGenreSelect: filtersState.onGenreSelect,
    onSortChange: filtersState.onSortChange,
    onMinRatingChange: filtersState.onMinRatingChange,
    onYearChange: filtersState.onYearChange,
    onLanguageChange: filtersState.onLanguageChange,
    onLoadMore: filtersState.onLoadMore,
  }
}
