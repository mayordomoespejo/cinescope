import { useQuery } from '@tanstack/react-query'
import { fetchDiscoverTV } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT, GC_TIME } from '@/lib/config'
import type { TVDiscoverParams } from '../types/tv'

export function useDiscoverTV(params: TVDiscoverParams, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.tvDiscover(params),
    queryFn: () => fetchDiscoverTV(params),
    staleTime: STALE_TIME_SHORT,
    gcTime: GC_TIME,
    enabled,
  })
}
