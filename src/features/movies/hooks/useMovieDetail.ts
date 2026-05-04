import { useQuery } from '@tanstack/react-query'
import { fetchMovieDetail } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'

/**
 * @description Fetches full movie details from TMDB. Query is disabled when id is null or 0.
 * @returns TanStack Query result with the MovieDetail object.
 */
export function useMovieDetail(id: number | null) {
  return useQuery({
    queryKey: queryKeys.movieDetail(id ?? 0),
    queryFn: () => fetchMovieDetail(id as number),
    staleTime: STALE_TIME_LONG,
    gcTime: 1000 * 60 * 30,
    enabled: id !== null && id > 0,
  })
}
