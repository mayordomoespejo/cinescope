import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useTVDetail } from '@/features/tv/hooks/useTVDetail'
import type { TVShowDetail } from '@/features/tv/types/tv'

// ── Module mocks ─────────────────────────────────────────────────────

vi.mock('@/features/tv/api/tvApi', () => ({
  fetchTVDetail: vi.fn(),
}))

import { fetchTVDetail } from '@/features/tv/api/tvApi'

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Creates a fresh QueryClient per test (no shared cache contamination)
 * and returns a wrapper component that provides it to the hook.
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,         // fail fast in tests
        gcTime: Infinity,     // keep data available for assertions
      },
    },
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}

const mockTVShow: TVShowDetail = {
  id: 1,
  name: 'Breaking Bad',
  overview: 'A chemistry teacher turns to meth.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  first_air_date: '2008-01-20',
  vote_average: 9.5,
  vote_count: 12000,
  genre_ids: [18, 80],
  original_language: 'en',
  popularity: 200,
  tagline: 'All Hail the King',
  number_of_seasons: 5,
  number_of_episodes: 62,
  status: 'Ended',
  genres: [{ id: 18, name: 'Drama' }],
  networks: [{ id: 174, name: 'AMC', logo_path: '/amclogo.png', origin_country: 'US' }],
  episode_run_time: [47],
  created_by: [{ id: 66633, name: 'Vince Gilligan', profile_path: '/vg.jpg' }],
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('useTVDetail', () => {
  beforeEach(() => {
    vi.mocked(fetchTVDetail).mockResolvedValue(mockTVShow)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns TV show data when given a valid id', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTVDetail(1), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockTVShow)
    expect(fetchTVDetail).toHaveBeenCalledWith(1)
  })

  it('returns loading state initially', () => {
    // fetchTVDetail never resolves during this assertion window
    vi.mocked(fetchTVDetail).mockReturnValue(new Promise(() => {}))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTVDetail(1), { wrapper })

    // Before the promise resolves the query should be loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('handles error state when fetchTVDetail rejects', async () => {
    vi.mocked(fetchTVDetail).mockRejectedValue(new Error('TMDB 404'))
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTVDetail(99), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error).message).toBe('TMDB 404')
  })

  it('does not fetch when id is null', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTVDetail(null), { wrapper })

    // isPending (disabled query) — should not trigger a fetch
    await new Promise(r => setTimeout(r, 50))

    expect(fetchTVDetail).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('does not fetch when id is 0', async () => {
    const { wrapper } = createWrapper()

    const { result } = renderHook(() => useTVDetail(0), { wrapper })

    await new Promise(r => setTimeout(r, 50))

    expect(fetchTVDetail).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })

  it('fetches fresh data when id changes', async () => {
    const show2: TVShowDetail = { ...mockTVShow, id: 2, name: 'Better Call Saul' }
    vi.mocked(fetchTVDetail)
      .mockResolvedValueOnce(mockTVShow)
      .mockResolvedValueOnce(show2)

    const { wrapper } = createWrapper()

    const { result, rerender } = renderHook(({ id }: { id: number | null }) => useTVDetail(id), {
      initialProps: { id: 1 as number | null },
      wrapper,
    })

    await waitFor(() => expect(result.current.data?.id).toBe(1))

    rerender({ id: 2 })

    await waitFor(() => expect(result.current.data?.id).toBe(2))

    expect(fetchTVDetail).toHaveBeenCalledTimes(2)
    expect(fetchTVDetail).toHaveBeenNthCalledWith(1, 1)
    expect(fetchTVDetail).toHaveBeenNthCalledWith(2, 2)
  })
})
