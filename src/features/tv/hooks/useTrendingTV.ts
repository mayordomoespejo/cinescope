import { useQuery } from '@tanstack/react-query'
import { fetchTrendingTV } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT } from '@/lib/config'

export function useTrendingTV(timeWindow: 'day' | 'week' = 'day', page: number = 1) {
  return useQuery({
    queryKey: queryKeys.tvTrending(timeWindow),
    queryFn: () => fetchTrendingTV(timeWindow, page),
    staleTime: STALE_TIME_SHORT,
  })
}
