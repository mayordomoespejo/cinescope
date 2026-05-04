import { useQuery } from '@tanstack/react-query'
import { fetchTVGenres } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

export function useTVGenres() {
  return useQuery({
    queryKey: queryKeys.tvGenres(),
    queryFn: () => fetchTVGenres(),
    staleTime: STALE_TIME_LONG,
    gcTime: 1000 * 60 * 30,
    select: data => data.genres,
  })
}
