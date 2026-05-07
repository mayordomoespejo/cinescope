/**
 * Tests for the movie-related TanStack Query hooks.
 * Covers: useTrending, useTopRated, useDiscover, useSearchMovies,
 *         useMovieCredits, useMovieRecommendations, usePersonDetail,
 *         usePersonMovieCredits, useMovieVideos (pickTrailer + fetchMovieVideosForQuery)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'

// ── Module mocks ──────────────────────────────────────────────────────

vi.mock('@/features/movies/api/tmdbApi', () => ({
  fetchTrending: vi.fn(),
  fetchTopRated: vi.fn(),
  fetchDiscover: vi.fn(),
  fetchSearchMovies: vi.fn(),
  fetchMovieCredits: vi.fn(),
  fetchMovieRecommendations: vi.fn(),
  fetchMovieVideos: vi.fn(),
}))

vi.mock('@/features/movies/api/personApi', () => ({
  fetchPersonDetail: vi.fn(),
  fetchPersonMovieCredits: vi.fn(),
}))

import {
  fetchTrending,
  fetchTopRated,
  fetchDiscover,
  fetchSearchMovies,
  fetchMovieCredits,
  fetchMovieRecommendations,
  fetchMovieVideos,
} from '@/features/movies/api/tmdbApi'
import { fetchPersonDetail, fetchPersonMovieCredits } from '@/features/movies/api/personApi'
import { useTrending } from '@/features/movies/hooks/useTrending'
import { useTopRated } from '@/features/movies/hooks/useTopRated'
import { useDiscover } from '@/features/movies/hooks/useDiscover'
import { useSearchMovies } from '@/features/movies/hooks/useSearch'
import { useMovieCredits } from '@/features/movies/hooks/useMovieCredits'
import { useMovieRecommendations } from '@/features/movies/hooks/useMovieRecommendations'
import { usePersonDetail } from '@/features/movies/hooks/usePersonDetail'
import { usePersonMovieCredits } from '@/features/movies/hooks/usePersonMovieCredits'
import { pickTrailer, fetchMovieVideosForQuery } from '@/features/movies/hooks/useMovieVideos'
import type { Video } from '@/features/movies/types/movie'

// ── Helpers ───────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}

const emptyPaginated = { page: 1, results: [], total_pages: 1, total_results: 0 }

beforeEach(() => {
  vi.mocked(fetchTrending).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchTopRated).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchDiscover).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchSearchMovies).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchMovieCredits).mockResolvedValue({ id: 1, cast: [], crew: [] })
  vi.mocked(fetchMovieRecommendations).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchMovieVideos).mockResolvedValue({ id: 1, results: [] })
  vi.mocked(fetchPersonDetail).mockResolvedValue({
    id: 1,
    name: 'Actor',
    biography: '',
    birthday: null,
    deathday: null,
    place_of_birth: null,
    profile_path: null,
    known_for_department: 'Acting',
    popularity: 10,
    imdb_id: null,
    homepage: null,
    also_known_as: [],
    gender: 0,
  })
  vi.mocked(fetchPersonMovieCredits).mockResolvedValue({ id: 1, cast: [], crew: [] })
})

afterEach(() => {
  vi.clearAllMocks()
})

// ── useTrending ───────────────────────────────────────────────────────

describe('useTrending', () => {
  it('fetches trending movies', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTrending(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTrending).toHaveBeenCalled()
  })
})

// ── useTopRated ───────────────────────────────────────────────────────

describe('useTopRated', () => {
  it('fetches top rated movies', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTopRated(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTopRated).toHaveBeenCalled()
  })
})

// ── useDiscover ───────────────────────────────────────────────────────

describe('useDiscover', () => {
  it('fetches discover movies when enabled', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDiscover({ page: 1 }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchDiscover).toHaveBeenCalledWith({ page: 1 })
  })

  it('does not fetch when disabled', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDiscover({ page: 1 }, false), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchDiscover).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })
})

// ── useSearchMovies ───────────────────────────────────────────────────

describe('useSearchMovies', () => {
  it('fetches search results for non-empty query', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useSearchMovies('batman'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchSearchMovies).toHaveBeenCalledWith('batman', 1)
  })

  it('does not fetch for empty query', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useSearchMovies(''), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchSearchMovies).not.toHaveBeenCalled()
  })

  it('does not fetch for whitespace-only query', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useSearchMovies('   '), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchSearchMovies).not.toHaveBeenCalled()
  })
})

// ── useMovieCredits ───────────────────────────────────────────────────

describe('useMovieCredits', () => {
  it('fetches credits for valid id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieCredits(42), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchMovieCredits).toHaveBeenCalledWith(42)
  })

  it('does not fetch for null id', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useMovieCredits(null), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchMovieCredits).not.toHaveBeenCalled()
  })

  it('does not fetch for id=0', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useMovieCredits(0), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchMovieCredits).not.toHaveBeenCalled()
  })
})

// ── useMovieRecommendations ───────────────────────────────────────────

describe('useMovieRecommendations', () => {
  it('fetches recommendations for valid id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useMovieRecommendations(42), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchMovieRecommendations).toHaveBeenCalledWith(42, 1)
  })

  it('does not fetch for null id', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useMovieRecommendations(null), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchMovieRecommendations).not.toHaveBeenCalled()
  })
})

// ── usePersonDetail ───────────────────────────────────────────────────

describe('usePersonDetail', () => {
  it('fetches person detail for valid id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => usePersonDetail(5), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchPersonDetail).toHaveBeenCalledWith(5)
  })

  it('does not fetch for null id', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => usePersonDetail(null), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchPersonDetail).not.toHaveBeenCalled()
  })
})

// ── usePersonMovieCredits ─────────────────────────────────────────────

describe('usePersonMovieCredits', () => {
  it('fetches person movie credits for valid id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => usePersonMovieCredits(5), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchPersonMovieCredits).toHaveBeenCalledWith(5)
  })

  it('does not fetch for null id', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => usePersonMovieCredits(null), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchPersonMovieCredits).not.toHaveBeenCalled()
  })
})

// ── pickTrailer (from useMovieVideos) ─────────────────────────────────

function makeVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: 'v1',
    key: 'abc123',
    name: 'Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2024-01-01T00:00:00.000Z',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    size: 1080,
    ...overrides,
  }
}

describe('pickTrailer (useMovieVideos)', () => {
  it('returns null for empty array', () => {
    expect(pickTrailer([])).toBeNull()
  })

  it('returns official YouTube Trailer', () => {
    const official = makeVideo({ id: 'official', official: true })
    const unofficial = makeVideo({ id: 'unofficial', official: false })
    expect(pickTrailer([unofficial, official])).toBe(official)
  })

  it('falls back to any YouTube Trailer', () => {
    const unofficial = makeVideo({ id: 'unofficial', official: false })
    const teaser = makeVideo({ id: 'teaser', type: 'Teaser', official: false })
    expect(pickTrailer([teaser, unofficial])).toBe(unofficial)
  })

  it('falls back to YouTube Teaser', () => {
    const teaser = makeVideo({ id: 'teaser', type: 'Teaser', official: false })
    expect(pickTrailer([teaser])).toBe(teaser)
  })
})

// ── fetchMovieVideosForQuery ──────────────────────────────────────────

describe('fetchMovieVideosForQuery', () => {
  it('returns data with trailer field', async () => {
    const official = makeVideo({ id: 'official', official: true })
    vi.mocked(fetchMovieVideos).mockResolvedValue({ id: 1, results: [official] })
    const result = await fetchMovieVideosForQuery(1)
    expect(result.trailer).toBe(official)
  })

  it('sets trailer to null when no suitable video', async () => {
    vi.mocked(fetchMovieVideos).mockResolvedValue({ id: 1, results: [] })
    const result = await fetchMovieVideosForQuery(1)
    expect(result.trailer).toBeNull()
  })
})
