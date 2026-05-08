import { useQuery } from '@tanstack/react-query'
import { fetchTVVideos } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_LONG, GC_TIME } from '@/lib/config'
import { pickTrailer } from '@/lib/videoUtils'

export { pickTrailer }

export function useTVVideos(id: number | null) {
  return useQuery({
    queryKey: queryKeys.tvVideos(id ?? 0),
    queryFn: () => fetchTVVideosForQuery(id as number),
    staleTime: STALE_TIME_LONG,
    gcTime: GC_TIME,
    enabled: id !== null && id > 0,
  })
}

/** Fetches videos and adds trailer. Use this for prefetch so cache shape matches the hook. */
export async function fetchTVVideosForQuery(id: number) {
  const data = await fetchTVVideos(id)
  return { ...data, trailer: pickTrailer(data.results) }
}
