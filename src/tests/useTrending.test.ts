import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useTrending } from '@/features/movies/hooks/useTrending'
import { useTrendingTV } from '@/features/tv/hooks/useTrendingTV'
import type { Movie, PaginatedResponse } from '@/features/movies/types/movie'
import type { TVShow, PaginatedResponse as TVPaginatedResponse } from '@/features/tv/types/tv'

// ── Module mocks ─────────────────────────────────────────────────────

vi.mock('@/features/movies/api/tmdbApi', () => ({
  fetchTrending: vi.fn(),
}))

vi.mock('@/features/tv/api/tvApi', () => ({
  fetchTrendingTV: vi.fn(),
}))

import { fetchTrending } from '@/features/movies/api/tmdbApi'
import { fetchTrendingTV } from '@/features/tv/api/tvApi'

// ── Helpers ───────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}

const mockMovie: Movie = {
  id: 1,
  title: 'Trending Movie',
  overview: 'A trending film.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2024-06-01',
  vote_average: 8.0,
  vote_count: 5000,
  genre_ids: [28, 12],
  popularity: 300,
  adult: false,
  original_language: 'en',
  original_title: 'Trending Movie',
}

const mockMoviePage: PaginatedResponse<Movie> = {
  page: 1,
  results: [mockMovie],
  total_pages: 10,
  total_results: 200,
}

const mockTVShow: TVShow = {
  id: 10,
  name: 'Trending Show',
  overview: 'A trending series.',
  poster_path: '/tvposter.jpg',
  backdrop_path: '/tvbackdrop.jpg',
  first_air_date: '2023-09-15',
  vote_average: 7.5,
  vote_count: 3000,
  genre_ids: [18],
  original_language: 'en',
  popularity: 150,
}

const mockTVPage: TVPaginatedResponse<TVShow> = {
  page: 1,
  results: [mockTVShow],
  total_pages: 5,
  total_results: 100,
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('useTrending', () => {
  beforeEach(() => {
    vi.mocked(fetchTrending).mockResolvedValue(mockMoviePage)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns trending movies for page 1 with default params', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTrending(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockMoviePage)
    expect(fetchTrending).toHaveBeenCalledWith('day', 1)
  })

  it('passes timeWindow param correctly', async () => {
    vi.mocked(fetchTrending).mockResolvedValue({ ...mockMoviePage, page: 1 })
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTrending('week', 1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(fetchTrending).toHaveBeenCalledWith('week', 1)
  })

  it('passes page param correctly', async () => {
    const page2: PaginatedResponse<Movie> = { ...mockMoviePage, page: 2 }
    vi.mocked(fetchTrending).mockResolvedValue(page2)
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTrending('day', 2), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.page).toBe(2)
    expect(fetchTrending).toHaveBeenCalledWith('day', 2)
  })

  it('uses separate cache entries for day vs week', async () => {
    vi.mocked(fetchTrending)
      .mockResolvedValueOnce(mockMoviePage)
      .mockResolvedValueOnce({ ...mockMoviePage, page: 1 })

    const { wrapper } = createWrapper()

    const { result: dayResult } = renderHook(() => useTrending('day', 1), { wrapper })
    await waitFor(() => expect(dayResult.current.isSuccess).toBe(true))

    const { result: weekResult } = renderHook(() => useTrending('week', 1), { wrapper })
    await waitFor(() => expect(weekResult.current.isSuccess).toBe(true))

    expect(fetchTrending).toHaveBeenCalledTimes(2)
    expect(fetchTrending).toHaveBeenNthCalledWith(1, 'day', 1)
    expect(fetchTrending).toHaveBeenNthCalledWith(2, 'week', 1)
  })
})

describe('useTrendingTV', () => {
  beforeEach(() => {
    vi.mocked(fetchTrendingTV).mockResolvedValue(mockTVPage)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns trending TV shows with default params', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTrendingTV(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockTVPage)
    expect(fetchTrendingTV).toHaveBeenCalledWith('day', 1)
  })

  it('passes timeWindow and page params correctly', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTrendingTV('week', 2), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(fetchTrendingTV).toHaveBeenCalledWith('week', 2)
  })

  it('returns loading state initially', () => {
    vi.mocked(fetchTrendingTV).mockReturnValue(new Promise(() => {}))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTrendingTV(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
