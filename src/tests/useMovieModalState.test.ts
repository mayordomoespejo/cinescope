import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useMovieModalState } from '@/features/movies/components/movie-modal/useMovieModalState'
import { useFavoritesStore } from '@/features/favorites/store'
import type { MovieDetail, Video } from '@/features/movies/types/movie'

// ── Mocks ─────────────────────────────────────────────────────────────

vi.mock('@/features/movies/api/tmdbApi', () => ({
  fetchMovieDetail: vi.fn(),
  fetchMovieVideos: vi.fn(),
}))

import { fetchMovieDetail, fetchMovieVideos } from '@/features/movies/api/tmdbApi'

const mockMovieDetail: MovieDetail = {
  id: 42,
  title: 'Inception',
  overview: 'A thief steals secrets.',
  poster_path: null,
  backdrop_path: null,
  release_date: '2010-07-16',
  vote_average: 8.4,
  vote_count: 32000,
  popularity: 200,
  adult: false,
  original_language: 'en',
  original_title: 'Inception',
  genres: [{ id: 28, name: 'Action' }],
  runtime: 148,
  tagline: null,
  status: 'Released',
  budget: 160000000,
  revenue: 836800000,
  imdb_id: null,
  homepage: null,
  production_companies: [],
  spoken_languages: [],
}

const mockTrailerVideo: Video = {
  id: 'v1',
  key: 'dQw4w9WgXcQ',
  name: 'Trailer',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
  published_at: '2024-01-01T00:00:00.000Z',
  iso_639_1: 'en',
  iso_3166_1: 'US',
  size: 1080,
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
  useFavoritesStore.setState({ favorites: [], watchlist: [] })
  localStorage.clear()
  vi.mocked(fetchMovieDetail).mockResolvedValue(mockMovieDetail)
  vi.mocked(fetchMovieVideos).mockResolvedValue({ id: 42, results: [mockTrailerVideo] })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useMovieModalState', () => {
  it('starts loading', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('resolves movie data', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    await waitFor(() => expect(result.current.movie).toBeDefined())
    expect(result.current.movie?.title).toBe('Inception')
  })

  it('starts with trailerPlaying=false', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    expect(result.current.trailerPlaying).toBe(false)
  })

  it('handlePlay sets trailerPlaying=true', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    await waitFor(() => expect(result.current.movie).toBeDefined())
    act(() => result.current.handlePlay())
    expect(result.current.trailerPlaying).toBe(true)
  })

  it('handleStopTrailer resets trailerPlaying', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    await waitFor(() => expect(result.current.movie).toBeDefined())
    act(() => result.current.handlePlay())
    act(() => result.current.handleStopTrailer())
    expect(result.current.trailerPlaying).toBe(false)
  })

  it('handlePlayWhenReady sets playWhenReady=true', () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    act(() => result.current.handlePlayWhenReady())
    expect(result.current.playWhenReady).toBe(true)
  })

  it('handleToggleFavorite adds movie to favorites', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    await waitFor(() => expect(result.current.movie).toBeDefined())
    act(() => result.current.handleToggleFavorite())
    expect(useFavoritesStore.getState().favorites).toHaveLength(1)
  })

  it('handleToggleWatchlist adds movie to watchlist', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    await waitFor(() => expect(result.current.movie).toBeDefined())
    act(() => result.current.handleToggleWatchlist())
    expect(useFavoritesStore.getState().watchlist).toHaveLength(1)
  })

  it('isFavorite reflects store state', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    await waitFor(() => expect(result.current.movie).toBeDefined())
    expect(result.current.isFavorite).toBe(false)
    act(() => result.current.handleToggleFavorite())
    await waitFor(() => expect(result.current.isFavorite).toBe(true))
  })

  it('handleToggleFavorite is no-op when movie is undefined', () => {
    vi.mocked(fetchMovieDetail).mockReturnValue(new Promise(() => {})) // never resolves
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    // movie is still undefined
    act(() => result.current.handleToggleFavorite())
    expect(useFavoritesStore.getState().favorites).toHaveLength(0)
  })

  it('handleToggleWatchlist is no-op when movie is undefined', () => {
    vi.mocked(fetchMovieDetail).mockReturnValue(new Promise(() => {}))
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    act(() => result.current.handleToggleWatchlist())
    expect(useFavoritesStore.getState().watchlist).toHaveLength(0)
  })

  it('error is null on success', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    await waitFor(() => expect(result.current.movie).toBeDefined())
    expect(result.current.error).toBeNull()
  })

  it('error is set on failure', async () => {
    vi.mocked(fetchMovieDetail).mockRejectedValue(new Error('Network error'))
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieModalState(42), { wrapper })
    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.error?.message).toBe('Network error')
  })
})
