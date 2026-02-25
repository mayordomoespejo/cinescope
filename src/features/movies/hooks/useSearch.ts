import { useQuery } from '@tanstack/react-query'
import { fetchSearchMovies } from '../api/tmdbApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT } from '@/lib/config'

export function useSearchMovies(query: string, page: number = 1) {
  return useQuery({
    queryKey: queryKeys.search(query, page),
    queryFn: () => fetchSearchMovies(query, page),
    staleTime: STALE_TIME_SHORT,
    enabled: query.trim().length > 0,
  })
}
