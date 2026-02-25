import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fetchMovieDetail } from '@/features/movies/api/tmdbApi'
import { fetchMovieVideosForQuery } from '@/features/movies/hooks/useMovieVideos'
import { queryKeys } from '@/lib/queryKeys'

export function useMoviePrefetch() {
  const queryClient = useQueryClient()

  const prefetchMovieData = useCallback(
    (id: number) => {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.movieDetail(id),
        queryFn: () => fetchMovieDetail(id),
      })
      void queryClient.prefetchQuery({
        queryKey: queryKeys.movieVideos(id),
        queryFn: () => fetchMovieVideosForQuery(id),
      })
    },
    [queryClient]
  )

  return { prefetchMovieData }
}
