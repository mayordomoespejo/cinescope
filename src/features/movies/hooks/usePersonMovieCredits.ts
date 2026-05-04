import { useQuery } from '@tanstack/react-query'
import { fetchPersonMovieCredits } from '../api/personApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG, GC_TIME } from '@/lib/config'

/**
 * React Query hook that fetches all movies a person appeared in or contributed to.
 * @param id - TMDB person ID, or null to skip the query.
 */
export function usePersonMovieCredits(id: number | null) {
  return useQuery({
    queryKey: queryKeys.personMovieCredits(id ?? 0),
    queryFn: () => fetchPersonMovieCredits(id as number),
    staleTime: STALE_TIME_LONG,
    gcTime: GC_TIME,
    enabled: id !== null && id > 0,
  })
}
