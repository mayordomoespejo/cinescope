import { useQuery } from '@tanstack/react-query'
import { fetchDiscover } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT, GC_TIME } from '@/lib/config'
import type { DiscoverParams } from '../types/movie'

/**
 * @description Fetches a filtered/sorted list of movies from the TMDB discover endpoint.
 * @returns TanStack Query result containing the discover response for the given params.
 */
export function useDiscover(params: DiscoverParams, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.discover(params),
    queryFn: () => fetchDiscover(params),
    staleTime: STALE_TIME_SHORT,
    gcTime: GC_TIME,
    enabled,
  })
}
