import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useBrowseMedia } from '@/hooks/useBrowseMedia'

// ── Mocks ─────────────────────────────────────────────────────────────

vi.mock('@/features/movies/api/tmdbApi', () => ({
  fetchTrending: vi
    .fn()
    .mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  fetchTopRated: vi
    .fn()
    .mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  fetchDiscover: vi
    .fn()
    .mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  fetchSearchMovies: vi
    .fn()
    .mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  fetchGenres: vi.fn().mockResolvedValue({ genres: [] }),
}))

vi.mock('@/features/tv/api/tvApi', () => ({
  fetchTrendingTV: vi
    .fn()
    .mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  fetchTopRatedTV: vi
    .fn()
    .mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  fetchDiscoverTV: vi
    .fn()
    .mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  fetchSearchTV: vi
    .fn()
    .mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 }),
  fetchTVGenres: vi.fn().mockResolvedValue({ genres: [] }),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: vi.fn(),
}))

vi.mock('@/components/ui/LayoutContext', () => ({
  useOutletContext: vi.fn().mockReturnValue({ onOpenMovie: vi.fn() }),
}))

vi.mock('@/features/movies/hooks/useMoviePrefetch', () => ({
  useMoviePrefetch: () => ({ prefetchMovieData: vi.fn() }),
}))

import { useSearchParams } from 'react-router-dom'
vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), vi.fn()])

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  return {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  }
}

describe('useBrowseMedia', () => {
  it('returns expected shape for movie mediaType', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useBrowseMedia('movie'), { wrapper })

    expect(Array.isArray(result.current.trendingMovies)).toBe(true)
    expect(Array.isArray(result.current.trendingShows)).toBe(true)
    expect(typeof result.current.onOpenMovie).toBe('function')
    expect(typeof result.current.onOpenShow).toBe('function')
    expect(typeof result.current.onGenreSelect).toBe('function')
    expect(typeof result.current.onSortChange).toBe('function')
    expect(typeof result.current.onMinRatingChange).toBe('function')
    expect(typeof result.current.onYearChange).toBe('function')
    expect(typeof result.current.onLanguageChange).toBe('function')
    expect(typeof result.current.onLoadMore).toBe('function')
  })

  it('returns expected shape for tv mediaType', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useBrowseMedia('tv'), { wrapper })

    expect(Array.isArray(result.current.trendingShows)).toBe(true)
    expect(typeof result.current.onOpenShow).toBe('function')
  })

  it('starts with default filter state', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useBrowseMedia('movie'), { wrapper })

    expect(result.current.filters.page).toBe(1)
    expect(result.current.filters.genre).toBeNull()
    expect(result.current.filters.sortBy).toBe('popularity.desc')
  })
})
