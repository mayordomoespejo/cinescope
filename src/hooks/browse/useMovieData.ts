import { useMemo } from 'react'
import { useSearchQuery } from '@/hooks/useSearchQuery'
import { useTrending } from '@/features/movies/hooks/useTrending'
import { useTopRated } from '@/features/movies/hooks/useTopRated'
import { useDiscover } from '@/features/movies/hooks/useDiscover'
import { useSearchMovies } from '@/features/movies/hooks/useSearch'
import type { FilterState } from '@/features/filters/types'
import type { Movie } from '@/features/movies/types/movie'

export interface MovieDataState {
  searchQuery: string
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
}

/**
 * Fetches all movie-specific data for the Browse page.
 * Hooks are always mounted so React Query can cache results in the background;
 * `enabled` flags gate actual network requests to the active media type.
 */
export function useMovieData(mediaType: 'movie' | 'tv', filters: FilterState): MovieDataState {
  const searchQuery = useSearchQuery()

  const { data: movieTrendingData, isLoading: movieTrendingLoading } = useTrending('day')
  const { data: movieTopRatedData, isLoading: movieTopRatedLoading } = useTopRated()
  const {
    data: movieDiscoverData,
    isLoading: movieDiscoverLoading,
    error: movieDiscoverError,
  } = useDiscover(
    {
      with_genres: filters.genre?.toString(),
      sort_by: filters.sortBy,
      page: filters.page,
      'vote_average.gte': filters.minRating > 0 ? filters.minRating : undefined,
      primary_release_year: filters.year,
      with_original_language: filters.language || undefined,
    },
    mediaType === 'movie' && !searchQuery
  )
  const {
    data: movieSearchData,
    isLoading: movieSearchLoading,
    error: movieSearchError,
  } = useSearchMovies(mediaType === 'movie' ? searchQuery : '')

  const trendingMovies = useMemo(() => movieTrendingData?.results ?? [], [movieTrendingData])
  const topRatedMovies = useMemo(() => movieTopRatedData?.results ?? [], [movieTopRatedData])
  const discoverMovies = useMemo(() => movieDiscoverData?.results ?? [], [movieDiscoverData])
  const searchMovies = useMemo(() => movieSearchData?.results ?? [], [movieSearchData])
  const hasNextMovieDiscover = filters.page < (movieDiscoverData?.total_pages ?? 1)
  const featuredMovie = useMemo(
    () => trendingMovies.find(m => !!m.backdrop_path) ?? trendingMovies[0],
    [trendingMovies]
  )

  return {
    searchQuery,
    trendingMovies,
    topRatedMovies,
    discoverMovies,
    searchMovies,
    featuredMovie,
    movieTrendingLoading,
    movieTopRatedLoading,
    movieDiscoverLoading,
    movieSearchLoading,
    movieDiscoverError,
    movieSearchError,
    hasNextMovieDiscover,
    totalMovieSearchResults: movieSearchData?.total_results,
  }
}
