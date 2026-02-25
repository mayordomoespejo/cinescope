import type { DiscoverParams } from '@/features/movies/types/movie'

export const queryKeys = {
  trending: (timeWindow: 'day' | 'week' = 'day') => ['trending', timeWindow] as const,

  topRated: (page: number = 1) => ['topRated', page] as const,

  discover: (params: DiscoverParams) => ['discover', params] as const,

  search: (query: string, page: number = 1) => ['search', query, page] as const,

  genres: () => ['genres'] as const,

  movieDetail: (id: number) => ['movie', id] as const,

  movieVideos: (id: number) => ['movie', id, 'videos'] as const,
}
