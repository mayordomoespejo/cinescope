import { useQuery } from '@tanstack/react-query'
import { fetchMovieRecommendations } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

/**
 * React Query hook that fetches movie recommendations based on a given movie.
 * @param id - TMDB movie ID, or null to skip the query.
 * @param page - Page number to fetch (defaults to 1).
 */
export function useMovieRecommendations(id: number | null, page: number = 1) {
  return useQuery({
    queryKey: queryKeys.movieRecommendations(id ?? 0, page),
    queryFn: () => fetchMovieRecommendations(id!, page),
    staleTime: STALE_TIME_LONG,
    gcTime: 1000 * 60 * 30,
    enabled: id !== null && id > 0,
  })
}
