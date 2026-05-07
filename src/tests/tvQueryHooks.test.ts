/**
 * Tests for the TV-related TanStack Query hooks.
 * Covers: useTrendingTV, useTopRatedTV, useDiscoverTV, useSearchTV,
 *         useTVCredits, useTVDetail, useTVRecommendations, useTVVideos
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'

// ── Module mocks ──────────────────────────────────────────────────────

vi.mock('@/features/tv/api/tvApi', () => ({
  fetchTrendingTV: vi.fn(),
  fetchTopRatedTV: vi.fn(),
  fetchDiscoverTV: vi.fn(),
  fetchSearchTV: vi.fn(),
  fetchTVCredits: vi.fn(),
  fetchTVDetail: vi.fn(),
  fetchTVRecommendations: vi.fn(),
  fetchTVVideos: vi.fn(),
}))

import {
  fetchTrendingTV,
  fetchTopRatedTV,
  fetchDiscoverTV,
  fetchSearchTV,
  fetchTVCredits,
  fetchTVDetail,
  fetchTVRecommendations,
  fetchTVVideos,
} from '@/features/tv/api/tvApi'

import { useTrendingTV } from '@/features/tv/hooks/useTrendingTV'
import { useTopRatedTV } from '@/features/tv/hooks/useTopRatedTV'
import { useDiscoverTV } from '@/features/tv/hooks/useDiscoverTV'
import { useSearchTV } from '@/features/tv/hooks/useSearchTV'
import { useTVCredits } from '@/features/tv/hooks/useTVCredits'
import { useTVDetail } from '@/features/tv/hooks/useTVDetail'
import { useTVRecommendations } from '@/features/tv/hooks/useTVRecommendations'
import { pickTrailer, fetchTVVideosForQuery } from '@/features/tv/hooks/useTVVideos'
import type { Video } from '@/features/tv/types/tv'

// ── Helpers ───────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper }
}

const emptyPaginated = { page: 1, results: [], total_pages: 1, total_results: 0 }

beforeEach(() => {
  vi.mocked(fetchTrendingTV).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchTopRatedTV).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchDiscoverTV).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchSearchTV).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchTVCredits).mockResolvedValue({ id: 1, cast: [], crew: [] } as never)
  vi.mocked(fetchTVDetail).mockResolvedValue({} as never)
  vi.mocked(fetchTVRecommendations).mockResolvedValue(emptyPaginated)
  vi.mocked(fetchTVVideos).mockResolvedValue({ id: 1, results: [] })
})

afterEach(() => {
  vi.clearAllMocks()
})

// ── useTrendingTV ─────────────────────────────────────────────────────

describe('useTrendingTV', () => {
  it('fetches trending TV shows', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTrendingTV(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTrendingTV).toHaveBeenCalledWith('day', 1)
  })

  it('fetches with week window', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTrendingTV('week', 2), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTrendingTV).toHaveBeenCalledWith('week', 2)
  })
})

// ── useTopRatedTV ─────────────────────────────────────────────────────

describe('useTopRatedTV', () => {
  it('fetches top rated TV shows', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTopRatedTV(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTopRatedTV).toHaveBeenCalledWith(1)
  })
})

// ── useDiscoverTV ─────────────────────────────────────────────────────

describe('useDiscoverTV', () => {
  it('fetches discover TV when enabled', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDiscoverTV({ page: 1 }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchDiscoverTV).toHaveBeenCalledWith({ page: 1 })
  })

  it('does not fetch when disabled', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useDiscoverTV({ page: 1 }, false), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchDiscoverTV).not.toHaveBeenCalled()
  })
})

// ── useSearchTV ───────────────────────────────────────────────────────

describe('useSearchTV', () => {
  it('fetches search results for non-empty query', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useSearchTV('breaking bad'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchSearchTV).toHaveBeenCalledWith('breaking bad', 1)
  })

  it('does not fetch for empty query', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useSearchTV(''), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchSearchTV).not.toHaveBeenCalled()
  })

  it('does not fetch for whitespace-only query', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useSearchTV('   '), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchSearchTV).not.toHaveBeenCalled()
  })
})

// ── useTVCredits ──────────────────────────────────────────────────────

describe('useTVCredits', () => {
  it('fetches TV credits for valid id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVCredits(99), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTVCredits).toHaveBeenCalledWith(99)
  })

  it('does not fetch for null id', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useTVCredits(null), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchTVCredits).not.toHaveBeenCalled()
  })

  it('does not fetch for id=0', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useTVCredits(0), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchTVCredits).not.toHaveBeenCalled()
  })
})

// ── useTVDetail ───────────────────────────────────────────────────────

describe('useTVDetail', () => {
  it('fetches TV detail for valid id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVDetail(99), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTVDetail).toHaveBeenCalledWith(99)
  })

  it('does not fetch for null id', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useTVDetail(null), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchTVDetail).not.toHaveBeenCalled()
  })
})

// ── useTVRecommendations ──────────────────────────────────────────────

describe('useTVRecommendations', () => {
  it('fetches recommendations for valid id', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVRecommendations(99), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTVRecommendations).toHaveBeenCalledWith(99, 1)
  })

  it('does not fetch for null id', async () => {
    const { wrapper } = createWrapper()
    renderHook(() => useTVRecommendations(null), { wrapper })
    await new Promise(r => setTimeout(r, 50))
    expect(fetchTVRecommendations).not.toHaveBeenCalled()
  })
})

// ── pickTrailer (from useTVVideos) ────────────────────────────────────

function makeVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: 'v1',
    key: 'abc',
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

describe('pickTrailer (useTVVideos)', () => {
  it('returns null for empty array', () => {
    expect(pickTrailer([])).toBeNull()
  })

  it('returns official YouTube trailer', () => {
    const official = makeVideo({ id: 'o', official: true })
    const unofficial = makeVideo({ id: 'u', official: false })
    expect(pickTrailer([unofficial, official])).toBe(official)
  })

  it('falls back to unofficial trailer', () => {
    const unofficial = makeVideo({ id: 'u', official: false })
    const teaser = makeVideo({ id: 't', type: 'Teaser', official: false })
    expect(pickTrailer([teaser, unofficial])).toBe(unofficial)
  })

  it('falls back to teaser', () => {
    const teaser = makeVideo({ id: 't', type: 'Teaser', official: false })
    expect(pickTrailer([teaser])).toBe(teaser)
  })
})

// ── fetchTVVideosForQuery ─────────────────────────────────────────────

describe('fetchTVVideosForQuery', () => {
  it('returns data with trailer field', async () => {
    const official = makeVideo({ id: 'o', official: true })
    vi.mocked(fetchTVVideos).mockResolvedValue({ id: 1, results: [official] })
    const result = await fetchTVVideosForQuery(1)
    expect(result.trailer).toBe(official)
  })

  it('sets trailer to null when no suitable video', async () => {
    vi.mocked(fetchTVVideos).mockResolvedValue({ id: 1, results: [] })
    const result = await fetchTVVideosForQuery(1)
    expect(result.trailer).toBeNull()
  })
})
