import { useQuery } from '@tanstack/react-query'
import { fetchTVVideos } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG } from '@/lib/config'
import type { Video } from '../types/tv'

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

export function useTVVideos(id: number | null) {
  return useQuery({
    queryKey: queryKeys.tvVideos(id ?? 0),
    queryFn: () => fetchTVVideosForQuery(id!),
    staleTime: STALE_TIME_LONG,
    gcTime: 1000 * 60 * 30,
    enabled: id !== null && id > 0,
  })
}

/** Fetches videos and adds trailer. Use this for prefetch so cache shape matches the hook. */
export async function fetchTVVideosForQuery(id: number) {
  const data = await fetchTVVideos(id)
  return { ...data, trailer: pickTrailer(data.results) }
}
