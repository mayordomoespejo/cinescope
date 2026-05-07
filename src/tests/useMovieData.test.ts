import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useMovieData } from '@/hooks/browse/useMovieData'
import type { FilterState } from '@/features/filters/types'
import type { Movie } from '@/features/movies/types/movie'

// ── Mocks ─────────────────────────────────────────────────────────────

vi.mock('@/features/movies/api/tmdbApi', () => ({
  fetchTrending: vi.fn(),
  fetchTopRated: vi.fn(),
  fetchDiscover: vi.fn(),
  fetchSearchMovies: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}))

import {
  fetchTrending,
  fetchTopRated,
  fetchDiscover,
  fetchSearchMovies,
} from '@/features/movies/api/tmdbApi'
import { useSearchParams } from 'react-router-dom'

const mockUseSearchParams = vi.mocked(useSearchParams)

const defaultFilters: FilterState = {
  genre: null,
  sortBy: 'popularity.desc',
  page: 1,
  minRating: 0,
  year: undefined,
  language: '',
}

function makeMovie(id: number, backdrop_path: string | null = null): Movie {
  return {
    id,
    title: `Movie ${id}`,
    overview: '',
    poster_path: null,
    backdrop_path,
    release_date: '2024-01-01',
    vote_average: 7,
    vote_count: 100,
    genre_ids: [],
    popularity: 50,
    adult: false,
    original_language: 'en',
    original_title: `Movie ${id}`,
  }
}

const emptyPaginated = { page: 1, results: [], total_pages: 1, total_results: 0 }

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  return {
    wrapper: ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  }
}

beforeEach(() => {
  mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()])
  vi.mocked(fetchTrending).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchTopRated).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchDiscover).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchSearchMovies).mockResolvedValue(emptyPaginated)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useMovieData', () => {
  it('returns empty arrays while loading', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieData('movie', defaultFilters), { wrapper })
    expect(result.current.trendingMovies).toEqual([])
    expect(result.current.discoverMovies).toEqual([])
  })

  it('returns trending movies on success', async () => {
    const movies = [makeMovie(1), makeMovie(2)]
    vi.mocked(fetchTrending).mockResolvedValue({ ...emptyPaginated, results: movies })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieData('movie', defaultFilters), { wrapper })
    await waitFor(() => expect(result.current.trendingMovies).toHaveLength(2))
  })

  it('featuredMovie is first trending movie with backdrop', async () => {
    const movies = [makeMovie(1, null), makeMovie(2, '/back.jpg'), makeMovie(3, null)]
    vi.mocked(fetchTrending).mockResolvedValue({ ...emptyPaginated, results: movies })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieData('movie', defaultFilters), { wrapper })
    await waitFor(() => expect(result.current.featuredMovie?.id).toBe(2))
  })

  it('featuredMovie falls back to first movie when no backdrop', async () => {
    const movies = [makeMovie(1, null), makeMovie(2, null)]
    vi.mocked(fetchTrending).mockResolvedValue({ ...emptyPaginated, results: movies })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieData('movie', defaultFilters), { wrapper })
    await waitFor(() => expect(result.current.featuredMovie?.id).toBe(1))
  })

  it('returns searchQuery from URL params', () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams('q=batman'), vi.fn()])
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieData('movie', defaultFilters), { wrapper })
    expect(result.current.searchQuery).toBe('batman')
  })

  it('passes minRating when > 0', async () => {
    const { wrapper } = createWrapper()
    const filtersWithRating: FilterState = { ...defaultFilters, minRating: 7 }
    renderHook(() => useMovieData('movie', filtersWithRating), { wrapper })
    await waitFor(() => expect(vi.mocked(fetchDiscover)).toHaveBeenCalled())
    const callArgs = vi.mocked(fetchDiscover).mock.calls[0][0]
    expect(callArgs['vote_average.gte']).toBe(7)
  })

  it('passes undefined minRating when 0', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useMovieData('movie', defaultFilters), { wrapper })
    await waitFor(() => expect(vi.mocked(fetchDiscover)).toHaveBeenCalled())
    const callArgs = vi.mocked(fetchDiscover).mock.calls[0][0]
    expect(callArgs['vote_average.gte']).toBeUndefined()
  })

  it('hasNextMovieDiscover is false when on last page', async () => {
    vi.mocked(fetchDiscover).mockResolvedValue({ ...emptyPaginated, total_pages: 1 })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieData('movie', defaultFilters), { wrapper })
    await waitFor(() => expect(result.current.movieDiscoverLoading).toBe(false))
    expect(result.current.hasNextMovieDiscover).toBe(false)
  })

  it('discover is disabled when mediaType is tv', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useMovieData('tv', defaultFilters), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(vi.mocked(fetchDiscover)).not.toHaveBeenCalled()
  })
})
