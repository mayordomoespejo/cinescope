import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'

// ── Mock deps ─────────────────────────────────────────────────────────

vi.mock('@/features/movies/api/tmdbApi', () => ({
  fetchMovieDetail: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/features/movies/hooks/useMovieVideos', () => ({
  fetchMovieVideosForQuery: vi.fn().mockResolvedValue({ results: [], trailer: null }),
}))

import { useMoviePrefetch } from '@/features/movies/hooks/useMoviePrefetch'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const prefetchQuery = vi.spyOn(queryClient, 'prefetchQuery').mockResolvedValue(undefined)
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, prefetchQuery }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('useMoviePrefetch', () => {
  it('returns prefetchMovieData function', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMoviePrefetch(), { wrapper })
    expect(typeof result.current.prefetchMovieData).toBe('function')
  })

  it('calls prefetchQuery twice when prefetchMovieData is called', () => {
    const { wrapper, prefetchQuery } = createWrapper()
    const { result } = renderHook(() => useMoviePrefetch(), { wrapper })
    result.current.prefetchMovieData(42)
    expect(prefetchQuery).toHaveBeenCalledTimes(2)
  })

  it('prefetches movie detail query key', () => {
    const { wrapper, prefetchQuery } = createWrapper()
    const { result } = renderHook(() => useMoviePrefetch(), { wrapper })
    result.current.prefetchMovieData(42)
    const keys = prefetchQuery.mock.calls.map(c => c[0].queryKey)
    expect(keys.some(k => JSON.stringify(k).includes('42'))).toBe(true)
  })
})
