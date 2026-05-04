import { useQuery } from '@tanstack/react-query'
import { fetchTVDetail } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG, GC_TIME } from '@/lib/config'

export function useTVDetail(id: number | null) {
  return useQuery({
    queryKey: queryKeys.tvDetail(id ?? 0),
    queryFn: () => fetchTVDetail(id as number),
    staleTime: STALE_TIME_LONG,
    gcTime: GC_TIME,
    enabled: id !== null && id > 0,
  })
}
