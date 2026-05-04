import { useQuery } from '@tanstack/react-query'
import { fetchTVGenres } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG, GC_TIME } from '@/lib/config'

/**
 * Fetches the TMDB TV genre list. Cached for 1 hour — genre lists change rarely.
 * Returns the genres array directly via TanStack Query `select`.
 */
export function useTVGenres() {
  return useQuery({
    queryKey: queryKeys.tvGenres(),
    queryFn: () => fetchTVGenres(),
    staleTime: STALE_TIME_LONG,
    gcTime: GC_TIME,
    select: data => data.genres,
  })
}
