import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useMovieDetail } from '@/features/movies/hooks/useMovieDetail'
import type { MovieDetail } from '@/features/movies/types/movie'

// ── Module mocks ─────────────────────────────────────────────────────

vi.mock('@/features/movies/api/tmdbApi', () => ({
  fetchMovieDetail: vi.fn(),
}))

import { fetchMovieDetail } from '@/features/movies/api/tmdbApi'

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

const mockMovieDetail: MovieDetail = {
  id: 42,
  title: 'Inception',
  overview: 'A thief who steals corporate secrets through dream-sharing technology.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2010-07-16',
  vote_average: 8.4,
  vote_count: 32000,
  popularity: 200,
  adult: false,
  original_language: 'en',
  original_title: 'Inception',
  genres: [
    { id: 878, name: 'Science Fiction' },
    { id: 28, name: 'Action' },
  ],
  runtime: 148,
  tagline: 'Your mind is the scene of the crime.',
  status: 'Released',
  budget: 160000000,
  revenue: 836800000,
  imdb_id: 'tt1375666',
  homepage: null,
  production_companies: [],
  spoken_languages: [],
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('useMovieDetail', () => {
  beforeEach(() => {
    vi.mocked(fetchMovieDetail).mockResolvedValue(mockMovieDetail)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns movie detail for a valid id', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useMovieDetail(42), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockMovieDetail)
    expect(fetchMovieDetail).toHaveBeenCalledWith(42)
  })

  it('does NOT fetch when id is null', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useMovieDetail(null), { wrapper })

    await new Promise(r => setTimeout(r, 50))

    expect(fetchMovieDetail).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('does NOT fetch when id is 0', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useMovieDetail(0), { wrapper })

    await new Promise(r => setTimeout(r, 50))

    expect(fetchMovieDetail).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns error state on API failure', async () => {
    vi.mocked(fetchMovieDetail).mockRejectedValue(new Error('TMDB 500'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useMovieDetail(99), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error).message).toBe('TMDB 500')
  })

  it('switches to the new movie when id changes', async () => {
    const otherMovie: MovieDetail = { ...mockMovieDetail, id: 7, title: 'Interstellar' }
    vi.mocked(fetchMovieDetail)
      .mockResolvedValueOnce(mockMovieDetail)
      .mockResolvedValueOnce(otherMovie)

    const { wrapper } = createWrapper()

    const { result, rerender } = renderHook(({ id }: { id: number | null }) => useMovieDetail(id), {
      initialProps: { id: 42 as number | null },
      wrapper,
    })

    await waitFor(() => expect(result.current.data?.id).toBe(42))

    rerender({ id: 7 })

    await waitFor(() => expect(result.current.data?.id).toBe(7))

    expect(fetchMovieDetail).toHaveBeenCalledTimes(2)
    expect(fetchMovieDetail).toHaveBeenNthCalledWith(1, 42)
    expect(fetchMovieDetail).toHaveBeenNthCalledWith(2, 7)
  })
})
