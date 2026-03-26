import { useQuery } from '@tanstack/react-query'
import { fetchTVRecommendations } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT } from '@/lib/config'

/**
 * Fetches TV show recommendations from TMDB for the given show ID.
 * @param tvId - TMDB TV show ID. Pass null to disable the query.
 * @param page - Page number (default 1).
 */
export function useTVRecommendations(tvId: number | null, page: number = 1) {
  return useQuery({
    queryKey: queryKeys.tvRecommendations(tvId ?? 0, page),
    queryFn: () => fetchTVRecommendations(tvId!, page),
    staleTime: STALE_TIME_SHORT,
    enabled: tvId !== null && tvId > 0,
  })
}
