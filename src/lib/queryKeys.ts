import type { DiscoverParams } from '@/features/movies/types/movie'
import type { TVDiscoverParams } from '@/features/tv/types/tv'

/**
 * @description Centralised TanStack Query key factory for all TMDB and TV-related queries.
 * Using this object ensures consistent cache keys across queries and prefetch calls.
 */
export const queryKeys = {
  trending: (timeWindow: 'day' | 'week' = 'day') => ['trending', timeWindow] as const,

  topRated: (page: number = 1) => ['topRated', page] as const,

  discover: (params: DiscoverParams) =>
    [
      'discover',
      params.page,
      params.with_genres,
      params.sort_by,
      params['vote_average.gte'],
      params['vote_count.gte'],
      params.year,
      params.language,
      params.primary_release_year,
      params.with_original_language,
    ] as const,

  search: (query: string, page: number = 1) => ['search', query, page] as const,

  genres: () => ['genres'] as const,

  movieDetail: (id: number) => ['movie', id] as const,

  movieVideos: (id: number) => ['movie', id, 'videos'] as const,

  movieCredits: (id: number) => ['movie', id, 'credits'] as const,

  movieRecommendations: (id: number, page: number = 1) =>
    ['movie', id, 'recommendations', page] as const,

  personDetail: (id: number) => ['person', id] as const,

  personMovieCredits: (id: number) => ['person', id, 'movie_credits'] as const,

  tvTrending: (timeWindow: 'day' | 'week' = 'day', page: number = 1) =>
    ['tv', 'trending', timeWindow, page] as const,

  tvTopRated: (page: number = 1) => ['tv', 'topRated', page] as const,

  tvDiscover: (params: TVDiscoverParams) =>
    [
      'tv',
      'discover',
      params.page,
      params.with_genres,
      params.sort_by,
      params['vote_average.gte'],
      params['vote_count.gte'],
      params.first_air_date_year,
      params.with_original_language,
      params.language,
    ] as const,

  tvSearch: (query: string, page: number = 1) => ['tv', 'search', query, page] as const,

  tvGenres: () => ['tv', 'genres'] as const,

  tvDetail: (id: number) => ['tv', id] as const,

  tvVideos: (id: number) => ['tv', id, 'videos'] as const,

  tvRecommendations: (id: number, page: number = 1) => ['tv', id, 'recommendations', page] as const,

  tvCredits: (id: number) => ['tv', id, 'credits'] as const,
}
