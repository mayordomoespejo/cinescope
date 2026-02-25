import { useQuery } from '@tanstack/react-query'
import { fetchGenres } from '@/features/movies/api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

export function useGenres() {
  return useQuery({
    queryKey: queryKeys.genres(),
    queryFn: () => fetchGenres(),
    staleTime: STALE_TIME_LONG,
    select: data => data.genres,
  })
}
