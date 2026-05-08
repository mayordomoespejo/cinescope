import { useQuery } from '@tanstack/react-query'
import { fetchMovieVideos } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG, GC_TIME } from '@/lib/config'
import { pickTrailer } from '@/lib/videoUtils'

export { pickTrailer }

/**
 * @description Fetches videos for a movie and appends a resolved `trailer` field. Query is disabled when id is null or 0.
 * @returns TanStack Query result with video list and the best trailer.
 */
export function useMovieVideos(id: number | null) {
  return useQuery({
    queryKey: queryKeys.movieVideos(id ?? 0),
    queryFn: () => fetchMovieVideosForQuery(id as number),
    staleTime: STALE_TIME_LONG,
    gcTime: GC_TIME,
    enabled: id !== null && id > 0,
  })
}

/** Fetches videos and adds trailer. Use this for prefetch so cache shape matches the hook. */
export async function fetchMovieVideosForQuery(id: number) {
  const data = await fetchMovieVideos(id)
  return { ...data, trailer: pickTrailer(data.results) }
}
