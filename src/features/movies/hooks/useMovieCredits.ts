import { useQuery } from '@tanstack/react-query'
import { fetchMovieCredits } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG, GC_TIME } from '@/lib/config'

/**
 * React Query hook that fetches the full cast and crew for a movie.
 * @param id - TMDB movie ID, or null to skip the query.
 */
export function useMovieCredits(id: number | null) {
  return useQuery({
    queryKey: queryKeys.movieCredits(id ?? 0),
    queryFn: () => fetchMovieCredits(id as number),
    staleTime: STALE_TIME_LONG,
    gcTime: GC_TIME,
    enabled: id !== null && id > 0,
  })
}
