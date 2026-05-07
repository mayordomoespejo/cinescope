import { useQuery } from '@tanstack/react-query'
import { fetchPersonDetail } from '../api/personApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG, GC_TIME } from '@/lib/config'

/**
 * React Query hook that fetches full details for a person (actor/director/etc).
 * @param id - TMDB person ID, or null to skip the query.
 */
export function usePersonDetail(id: number | null) {
  return useQuery({
    queryKey: queryKeys.personDetail(id ?? 0),
    queryFn: () => fetchPersonDetail(id as number),
    staleTime: STALE_TIME_LONG,
    gcTime: GC_TIME,
    enabled: id !== null && id > 0,
  })
}
