import { useQuery } from '@tanstack/react-query'
import { fetchTopRated } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

export function useTopRated(page: number = 1) {
  return useQuery({
    queryKey: queryKeys.topRated(page),
    queryFn: () => fetchTopRated(page),
    staleTime: STALE_TIME_LONG,
  })
}
