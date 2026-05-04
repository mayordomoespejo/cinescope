import { useQuery } from '@tanstack/react-query'
import { fetchSearchTV } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT, GC_TIME } from '@/lib/config'

/**
 * Searches TV shows by query string via TMDB search API.
 * Query is disabled when the trimmed string is empty.
 *
 * @param query - Search term; must be non-empty to trigger a request
 * @param page - Results page (1-based, default 1)
 */
export function useSearchTV(query: string, page: number = 1) {
  return useQuery({
    queryKey: queryKeys.tvSearch(query, page),
    queryFn: () => fetchSearchTV(query, page),
    staleTime: STALE_TIME_SHORT,
    gcTime: GC_TIME,
    enabled: query.trim().length > 0,
  })
}
