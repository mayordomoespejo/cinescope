import { useQuery } from '@tanstack/react-query'
import { fetchGenres } from '@/features/movies/api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

/**
 * @description Fetches the list of TMDB movie genres. Returns only the genres array via TanStack Query `select`.
 * @returns TanStack Query result containing an array of genre objects.
 */
export function useGenres() {
  return useQuery({
    queryKey: queryKeys.genres(),
    queryFn: () => fetchGenres(),
    staleTime: STALE_TIME_LONG,
    select: data => data.genres,
  })
}
