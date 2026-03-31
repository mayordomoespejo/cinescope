import { useQuery } from '@tanstack/react-query'
import { fetchTVDetail } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

export function useTVDetail(id: number | null) {
  return useQuery({
    queryKey: queryKeys.tvDetail(id ?? 0),
    queryFn: () => fetchTVDetail(id!),
    staleTime: STALE_TIME_LONG,
    gcTime: 1000 * 60 * 30,
    enabled: id !== null && id > 0,
  })
}
