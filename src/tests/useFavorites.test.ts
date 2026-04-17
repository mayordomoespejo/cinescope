import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import type { Movie } from '@/features/movies/types/movie'

// ── Module mocks ─────────────────────────────────────────────────────

vi.mock('@/features/favorites/store', () => ({
  hydrateFromSupabase: vi.fn(),
  syncFavoritesToSupabase: vi.fn(),
  syncWatchlistToSupabase: vi.fn(),
}))

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/components/ui/Toast', () => ({
  useToast: vi.fn(() => vi.fn()),
}))

// Mock retrySync to call fn() once with no delays — tests verify the rollback
// logic, not the retry/backoff behaviour (covered by retrySync.test.ts).
vi.mock('@/lib/retrySync', () => ({
  retrySync: vi.fn((fn: () => Promise<unknown>) => fn()),
}))

import { hydrateFromSupabase, syncFavoritesToSupabase } from '@/features/favorites/store'
import { useAuth } from '@/features/auth/useAuth'

// ── Helpers ───────────────────────────────────────────────────────────

function makeUser(uid = 'user-1') {
  return {
    uid,
    getIdToken: vi.fn().mockResolvedValue('mock-token'),
  }
}

const movieA: Movie = {
  id: 1,
  title: 'Movie A',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2024-01-01',
  vote_average: 7,
  vote_count: 100,
  genre_ids: [],
  popularity: 10,
  adult: false,
  original_language: 'en',
  original_title: 'Movie A',
}

const movieB: Movie = {
  id: 2,
  title: 'Movie B',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2024-02-01',
  vote_average: 8,
  vote_count: 200,
  genre_ids: [],
  popularity: 20,
  adult: false,
  original_language: 'en',
  original_title: 'Movie B',
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('useFavorites', () => {
  beforeEach(() => {
    vi.mocked(hydrateFromSupabase).mockResolvedValue({ favorites: [], watchlist: [] })
    vi.mocked(syncFavoritesToSupabase).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('hydration on mount', () => {
    it('loads favorites from Supabase when user is authenticated', async () => {
      const user = makeUser()
      vi.mocked(useAuth).mockReturnValue({ user } as ReturnType<typeof useAuth>)
      vi.mocked(hydrateFromSupabase).mockResolvedValue({
        favorites: [movieA],
        watchlist: [movieB],
      })

      const { result } = renderHook(() => useFavorites())

      await waitFor(() => {
        expect(result.current.favorites).toEqual([movieA])
        expect(result.current.watchlist).toEqual([movieB])
        expect(result.current.isLoading).toBe(false)
      })

      expect(hydrateFromSupabase).toHaveBeenCalledWith('mock-token', expect.any(AbortSignal))
    })

    it('does not call hydrateFromSupabase when user is null', () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>)

      renderHook(() => useFavorites())

      expect(hydrateFromSupabase).not.toHaveBeenCalled()
    })

    it('clears state when user logs out', async () => {
      const user = makeUser()
      vi.mocked(useAuth).mockReturnValue({ user } as ReturnType<typeof useAuth>)
      vi.mocked(hydrateFromSupabase).mockResolvedValue({
        favorites: [movieA],
        watchlist: [],
      })

      const { result, rerender } = renderHook(() => useFavorites())
      await waitFor(() => expect(result.current.favorites).toEqual([movieA]))

      // Simulate logout
      vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>)
      rerender()

      await waitFor(() => {
        expect(result.current.favorites).toEqual([])
        expect(result.current.watchlist).toEqual([])
      })
    })
  })

  describe('toggleFavorite', () => {
    it('adds a movie optimistically when it is not in favorites', async () => {
      const user = makeUser()
      vi.mocked(useAuth).mockReturnValue({ user } as ReturnType<typeof useAuth>)

      const { result } = renderHook(() => useFavorites())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.toggleFavorite(movieA)
      })

      expect(result.current.favorites).toContainEqual(movieA)
      expect(result.current.isFavorite(movieA.id)).toBe(true)
    })

    it('removes a movie optimistically when it is already in favorites', async () => {
      const user = makeUser()
      vi.mocked(useAuth).mockReturnValue({ user } as ReturnType<typeof useAuth>)
      vi.mocked(hydrateFromSupabase).mockResolvedValue({
        favorites: [movieA],
        watchlist: [],
      })

      const { result } = renderHook(() => useFavorites())
      await waitFor(() => expect(result.current.favorites).toEqual([movieA]))

      await act(async () => {
        await result.current.toggleFavorite(movieA)
      })

      expect(result.current.favorites).not.toContainEqual(movieA)
      expect(result.current.isFavorite(movieA.id)).toBe(false)
    })

    it('rolls back favorites when Supabase sync fails', async () => {
      const user = makeUser()
      vi.mocked(useAuth).mockReturnValue({ user } as ReturnType<typeof useAuth>)
      vi.mocked(hydrateFromSupabase).mockResolvedValue({
        favorites: [movieA],
        watchlist: [],
      })

      // Sync will reject — rollback should restore previous state.
      // Use a deferred promise so we control when the failure arrives, allowing
      // the test to observe the optimistic state before the rollback fires.
      let rejectSync!: (err: Error) => void
      vi.mocked(syncFavoritesToSupabase).mockReturnValue(
        new Promise((_, reject) => { rejectSync = reject })
      )

      const { result } = renderHook(() => useFavorites())
      await waitFor(() => expect(result.current.favorites).toEqual([movieA]))

      // Optimistic removal of movieA
      await act(async () => {
        await result.current.toggleFavorite(movieA)
      })

      // Optimistic state: movieA removed
      expect(result.current.isFavorite(movieA.id)).toBe(false)

      // Trigger the sync failure — rollback should restore movieA
      await act(async () => {
        rejectSync(new Error('Network error'))
        await Promise.resolve()
        await Promise.resolve()
      })

      // State should be rolled back to include movieA again
      await waitFor(() => {
        expect(result.current.isFavorite(movieA.id)).toBe(true)
      })
    })

    it('does not sync to Supabase when user is not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>)

      const { result } = renderHook(() => useFavorites())

      await act(async () => {
        await result.current.toggleFavorite(movieA)
      })

      // Optimistic state update still happens locally — but no remote sync is triggered
      expect(result.current.isFavorite(movieA.id)).toBe(true)
      expect(syncFavoritesToSupabase).not.toHaveBeenCalled()
    })
  })
})
