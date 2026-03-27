import { useQuery } from '@tanstack/react-query'
import { fetchTrending } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT } from '@/lib/config'

/**
 * @description Fetches trending movies for a given time window from TMDB.
 * @returns TanStack Query result containing a paginated list of trending movies.
 */
export function useTrending(timeWindow: 'day' | 'week' = 'day', page: number = 1) {
  return useQuery({
    queryKey: queryKeys.trending(timeWindow),
    queryFn: () => fetchTrending(timeWindow, page),
    staleTime: STALE_TIME_SHORT,
  })
}
