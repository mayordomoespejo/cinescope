import { useQuery } from '@tanstack/react-query'
import { fetchTopRated } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

/**
 * @description Fetches the top-rated movies from TMDB for the given page.
 * @returns TanStack Query result containing a paginated list of top-rated movies.
 */
export function useTopRated(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.topRated(page),
    queryFn: () => fetchTopRated(page),
    staleTime: STALE_TIME_LONG,
    gcTime: 1000 * 60 * 30,
  })
}
