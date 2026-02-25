import { useQuery } from '@tanstack/react-query'
import { fetchDiscover } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT } from '@/lib/config'
import type { DiscoverParams } from '../types/movie'

export function useDiscover(params: DiscoverParams, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.discover(params),
    queryFn: () => fetchDiscover(params),
    staleTime: STALE_TIME_SHORT,
    enabled,
  })
}
