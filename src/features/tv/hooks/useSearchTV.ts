import { useQuery } from '@tanstack/react-query'
import { fetchSearchTV } from '../api/tvApi'
import { queryKeys } from '@/lib/queryKeys'
import { STALE_TIME_SHORT } from '@/lib/config'

export function useSearchTV(query: string, page: number = 1) {
  return useQuery({
    queryKey: queryKeys.tvSearch(query, page),
    queryFn: () => fetchSearchTV(query, page),
    staleTime: STALE_TIME_SHORT,
    gcTime: 1000 * 60 * 30,
    enabled: query.trim().length > 0,
  })
}
