import { useQuery } from '@tanstack/react-query'
import { fetchTrendingTV } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT, GC_TIME } from '@/lib/config'

export function useTrendingTV(timeWindow: 'day' | 'week' = 'day', page: number = 1) {
  return useQuery({
    queryKey: queryKeys.tvTrending(timeWindow, page),
    queryFn: () => fetchTrendingTV(timeWindow, page),
    staleTime: STALE_TIME_SHORT,
    gcTime: GC_TIME,
  })
}
