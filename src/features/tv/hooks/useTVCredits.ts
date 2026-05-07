import { useQuery } from '@tanstack/react-query'
import { fetchTVCredits } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG, GC_TIME } from '@/lib/config'

/**
 * Fetches cast and crew credits for a TV show from TMDB.
 * @param tvId - TMDB TV show ID. Pass null to disable the query.
 */
export function useTVCredits(tvId: number | null) {
  return useQuery({
    queryKey: queryKeys.tvCredits(tvId ?? 0),
    queryFn: () => fetchTVCredits(tvId as number),
    staleTime: STALE_TIME_LONG,
    gcTime: GC_TIME,
    enabled: tvId !== null && tvId > 0,
  })
}
