import { useQuery } from '@tanstack/react-query'
import { fetchSearchMovies } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT, GC_TIME } from '@/lib/config'

/**
 * @description Searches TMDB for movies matching the given query string. Skips the query when the string is empty.
 * @returns TanStack Query result with a paginated list of matching movies.
 */
export function useSearchMovies(query: string, page: number = 1) {
  return useQuery({
    queryKey: queryKeys.search(query, page),
    queryFn: () => fetchSearchMovies(query, page),
    staleTime: STALE_TIME_SHORT,
    gcTime: GC_TIME,
    enabled: query.trim().length > 0,
  })
}
