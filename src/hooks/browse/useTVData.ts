import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTrendingTV } from '@/features/tv/hooks/useTrendingTV'
import { useTopRatedTV } from '@/features/tv/hooks/useTopRatedTV'
import { useDiscoverTV } from '@/features/tv/hooks/useDiscoverTV'
import { useSearchTV } from '@/features/tv/hooks/useSearchTV'
import { useTVGenres } from '@/features/tv/hooks/useTVGenres'
import type { FilterState } from '@/features/filters/types'
import type { TVShow } from '@/features/tv/types/tv'

export interface TVDataState {
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
}

/**
 * Fetches all TV-specific data for the Browse page.
 * Hooks are always mounted so React Query can cache results in the background;
 * `enabled` flags gate actual network requests to the active media type.
 */
export function useTVData(
  mediaType: 'movie' | 'tv',
  filters: FilterState
): TVDataState {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''

  const { data: tvGenres = [], isLoading: tvGenresLoading, isError: tvGenresError } = useTVGenres()

  const { data: tvTrendingData, isLoading: tvTrendingLoading } = useTrendingTV('day')
  const { data: tvTopRatedData, isLoading: tvTopRatedLoading } = useTopRatedTV()
  const {
    data: tvDiscoverData,
    isLoading: tvDiscoverLoading,
    error: tvDiscoverError,
  } = useDiscoverTV(
    {
      with_genres: filters.genre?.toString(),
      sort_by: filters.sortBy,
      page: filters.page,
      'vote_average.gte': filters.minRating > 0 ? filters.minRating : undefined,
      first_air_date_year: filters.year,
      with_original_language: filters.language || undefined,
    },
    mediaType === 'tv' && !searchQuery
  )
  const {
    data: tvSearchData,
    isLoading: tvSearchLoading,
    error: tvSearchError,
  } = useSearchTV(mediaType === 'tv' ? searchQuery : '')

  const trendingShows = useMemo(() => tvTrendingData?.results ?? [], [tvTrendingData])
  const topRatedShows = useMemo(() => tvTopRatedData?.results ?? [], [tvTopRatedData])
  const discoverShows = useMemo(() => tvDiscoverData?.results ?? [], [tvDiscoverData])
  const searchShows = useMemo(() => tvSearchData?.results ?? [], [tvSearchData])
  const hasNextTVDiscover = filters.page < (tvDiscoverData?.total_pages ?? 1)
  const featuredShow = useMemo(
    () => trendingShows.find(s => !!s.backdrop_path) ?? trendingShows[0],
    [trendingShows]
  )

  return {
    trendingShows,
    topRatedShows,
    discoverShows,
    searchShows,
    featuredShow,
    tvTrendingLoading,
    tvTopRatedLoading,
    tvDiscoverLoading,
    tvSearchLoading,
    tvDiscoverError,
    tvSearchError,
    hasNextTVDiscover,
    totalTVSearchResults: tvSearchData?.total_results,
    tvGenres,
    tvGenresLoading,
    tvGenresError,
  }
}
