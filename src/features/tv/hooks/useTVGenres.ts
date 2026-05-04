import { useQuery } from '@tanstack/react-query'
import { fetchTVGenres } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG, GC_TIME } from '@/lib/config'

export function useTVGenres() {
  return useQuery({
    queryKey: queryKeys.tvGenres(),
    queryFn: () => fetchTVGenres(),
    staleTime: STALE_TIME_LONG,
    gcTime: GC_TIME,
    select: data => data.genres,
  })
}
