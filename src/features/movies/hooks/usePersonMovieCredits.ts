import { useQuery } from '@tanstack/react-query'
import { fetchPersonMovieCredits } from '../api/personApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

/**
 * React Query hook that fetches all movies a person appeared in or contributed to.
 * @param id - TMDB person ID, or null to skip the query.
 */
export function usePersonMovieCredits(id: number | null) {
  return useQuery({
    queryKey: queryKeys.personMovieCredits(id ?? 0),
    queryFn: () => fetchPersonMovieCredits(id as number),
    staleTime: STALE_TIME_LONG,
    gcTime: 1000 * 60 * 30,
    enabled: id !== null && id > 0,
  })
}
