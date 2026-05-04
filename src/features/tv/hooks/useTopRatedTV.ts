import { useQuery } from '@tanstack/react-query'
import { fetchTopRatedTV } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

export function useTopRatedTV(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.tvTopRated(page),
    queryFn: () => fetchTopRatedTV(page),
    staleTime: STALE_TIME_LONG,
    gcTime: 1000 * 60 * 30,
  })
}
