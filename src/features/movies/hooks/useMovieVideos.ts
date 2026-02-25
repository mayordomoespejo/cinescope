import { useQuery } from '@tanstack/react-query'
import { fetchMovieVideos } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'
import type { Video } from '../types/movie'

export function pickTrailer(videos: Video[]): Video | null {
  // Priority: official YouTube trailer
  const official = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official)
  if (official) return official

  // Fallback: any YouTube trailer
  const anyTrailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
  if (anyTrailer) return anyTrailer

  // Fallback: any YouTube teaser
  const teaser = videos.find(v => v.site === 'YouTube' && v.type === 'Teaser')
  return teaser ?? null
}

export function useMovieVideos(id: number | null) {
  return useQuery({
    queryKey: queryKeys.movieVideos(id ?? 0),
    queryFn: () => fetchMovieVideosForQuery(id!),
    staleTime: STALE_TIME_LONG,
    enabled: id !== null && id > 0,
  })
}

/** Fetches videos and adds trailer. Use this for prefetch so cache shape matches the hook. */
export async function fetchMovieVideosForQuery(id: number) {
  const data = await fetchMovieVideos(id)
  return { ...data, trailer: pickTrailer(data.results) }
}
