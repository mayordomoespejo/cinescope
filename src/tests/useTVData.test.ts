import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useTVData } from '@/hooks/browse/useTVData'
import type { FilterState } from '@/features/filters/types'
import type { TVShow } from '@/features/tv/types/tv'

vi.mock('@/features/tv/api/tvApi', () => ({
  fetchTrendingTV: vi.fn(),
  fetchTopRatedTV: vi.fn(),
  fetchDiscoverTV: vi.fn(),
  fetchSearchTV: vi.fn(),
  fetchTVGenres: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}))

import {
  fetchTrendingTV,
  fetchTopRatedTV,
  fetchDiscoverTV,
  fetchSearchTV,
  fetchTVGenres,
} from '@/features/tv/api/tvApi'
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

const emptyPaginated = { page: 1, results: [], total_pages: 1, total_results: 0 }

function makeShow(id: number, backdrop_path: string | null = null): TVShow {
  return {
    id,
    name: `Show ${id}`,
    overview: '',
    poster_path: null,
    backdrop_path,
    first_air_date: '2024-01-01',
    vote_average: 7,
    vote_count: 100,
    genre_ids: [],
    original_language: 'en',
    popularity: 50,
  }
}

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
  vi.mocked(fetchTrendingTV).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchTopRatedTV).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchDiscoverTV).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchSearchTV).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchTVGenres).mockResolvedValue({ genres: [] })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useTVData', () => {
  it('returns empty arrays while loading', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVData('tv', defaultFilters), { wrapper })
    expect(result.current.trendingShows).toEqual([])
    expect(result.current.discoverShows).toEqual([])
  })

  it('returns trending shows on success', async () => {
    const shows = [makeShow(1), makeShow(2)]
    vi.mocked(fetchTrendingTV).mockResolvedValue({ ...emptyPaginated, results: shows })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVData('tv', defaultFilters), { wrapper })
    await waitFor(() => expect(result.current.trendingShows).toHaveLength(2))
  })

  it('featuredShow is first show with backdrop', async () => {
    const shows = [makeShow(1, null), makeShow(2, '/back.jpg')]
    vi.mocked(fetchTrendingTV).mockResolvedValue({ ...emptyPaginated, results: shows })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVData('tv', defaultFilters), { wrapper })
    await waitFor(() => expect(result.current.featuredShow?.id).toBe(2))
  })

  it('featuredShow falls back to first when no backdrop', async () => {
    const shows = [makeShow(1, null), makeShow(2, null)]
    vi.mocked(fetchTrendingTV).mockResolvedValue({ ...emptyPaginated, results: shows })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVData('tv', defaultFilters), { wrapper })
    await waitFor(() => expect(result.current.featuredShow?.id).toBe(1))
  })

  it('discover is disabled when mediaType is movie', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useTVData('movie', defaultFilters), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(vi.mocked(fetchDiscoverTV)).not.toHaveBeenCalled()
  })

  it('search is disabled when mediaType is movie', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useTVData('movie', defaultFilters), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(vi.mocked(fetchSearchTV)).not.toHaveBeenCalled()
  })

  it('returns tvGenres', async () => {
    const genres = [{ id: 18, name: 'Drama' }]
    vi.mocked(fetchTVGenres).mockResolvedValue({ genres })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVData('tv', defaultFilters), { wrapper })
    await waitFor(() => expect(result.current.tvGenres).toHaveLength(1))
    expect(result.current.tvGenres[0].name).toBe('Drama')
  })

  it('passes minRating when > 0', async () => {
    const filtersWithRating: FilterState = { ...defaultFilters, minRating: 8 }
    const { wrapper } = createWrapper()
    renderHook(() => useTVData('tv', filtersWithRating), { wrapper })
    await waitFor(() => expect(vi.mocked(fetchDiscoverTV)).toHaveBeenCalled())
    const callArgs = vi.mocked(fetchDiscoverTV).mock.calls[0][0]
    expect(callArgs['vote_average.gte']).toBe(8)
  })

  it('hasNextTVDiscover is false when on last page', async () => {
    vi.mocked(fetchDiscoverTV).mockResolvedValue({ ...emptyPaginated, total_pages: 1 })
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVData('tv', defaultFilters), { wrapper })
    await waitFor(() => expect(result.current.tvDiscoverLoading).toBe(false))
    expect(result.current.hasNextTVDiscover).toBe(false)
  })
})
