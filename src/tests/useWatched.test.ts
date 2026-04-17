import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWatched } from '@/features/watched/useWatched'
import type { WatchedItem } from '@/features/watched/store'

// ── Module mocks ─────────────────────────────────────────────────────

vi.mock('@/features/auth/firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
}))

vi.mock('@/features/auth/authService', () => ({
  onAuthStateChanged: vi.fn(),
}))

vi.mock('@/features/watched/store', () => ({
  upsertToSupabase: vi.fn(),
  deleteFromSupabase: vi.fn(),
  hydrateWatched: vi.fn(),
}))

// Mock retrySync to call fn() once with no delays — tests verify the rollback
// logic, not the retry/backoff behaviour (covered by retrySync.test.ts).
vi.mock('@/lib/retrySync', () => ({
  retrySync: vi.fn((fn: () => Promise<unknown>) => fn()),
}))

import { auth } from '@/features/auth/firebaseConfig'
import { onAuthStateChanged } from '@/features/auth/authService'
import { upsertToSupabase, deleteFromSupabase, hydrateWatched } from '@/features/watched/store'

// ── Helpers ───────────────────────────────────────────────────────────

type AuthCallback = (user: { uid: string; getIdToken: () => Promise<string> } | null) => void

/** Captures the auth callback so tests can trigger auth state changes manually. */
function captureAuthCallback(): { triggerAuth: (user: Parameters<AuthCallback>[0]) => void } {
  let captured!: AuthCallback
  vi.mocked(onAuthStateChanged).mockImplementation(cb => {
    captured = cb as AuthCallback
    return () => {}
  })
  return {
    triggerAuth: user => captured(user),
  }
}

function makeUser(uid = 'user-1') {
  return {
    uid,
    getIdToken: vi.fn().mockResolvedValue('mock-token'),
  }
}

const itemMovie: Omit<WatchedItem, 'watched_at'> = {
  media_id: 1,
  media_type: 'movie',
  media_data: {
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
  },
}

const watchedEntry: WatchedItem = {
  ...itemMovie,
  watched_at: '2024-01-01T00:00:00.000Z',
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('useWatched', () => {
  beforeEach(() => {
    vi.mocked(hydrateWatched).mockResolvedValue([])
    vi.mocked(upsertToSupabase).mockResolvedValue(undefined)
    vi.mocked(deleteFromSupabase).mockResolvedValue(undefined)
    // Reset auth.currentUser to null
    Object.defineProperty(auth, 'currentUser', { value: null, writable: true, configurable: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('hydration on mount', () => {
    it('loads watched list from Supabase when user authenticates', async () => {
      const { triggerAuth } = captureAuthCallback()
      vi.mocked(hydrateWatched).mockResolvedValue([watchedEntry])

      const { result } = renderHook(() => useWatched())

      await act(async () => {
        triggerAuth(makeUser())
      })

      await waitFor(() => {
        expect(result.current.watchedList).toEqual([watchedEntry])
        expect(result.current.loading).toBe(false)
      })

      expect(hydrateWatched).toHaveBeenCalledWith('mock-token')
    })

    it('clears state when user signs out', async () => {
      const { triggerAuth } = captureAuthCallback()
      vi.mocked(hydrateWatched).mockResolvedValue([watchedEntry])

      const { result } = renderHook(() => useWatched())

      await act(async () => {
        triggerAuth(makeUser())
      })
      await waitFor(() => expect(result.current.watchedList).toEqual([watchedEntry]))

      await act(async () => {
        triggerAuth(null)
      })

      expect(result.current.watchedList).toEqual([])
    })
  })

  describe('toggleWatched', () => {
    it('adds an item optimistically when it is not watched', async () => {
      const { triggerAuth } = captureAuthCallback()
      const user = makeUser()

      // Set auth.currentUser so toggleWatched can read it
      Object.defineProperty(auth, 'currentUser', {
        value: user,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useWatched())

      await act(async () => {
        triggerAuth(user)
      })
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.toggleWatched(itemMovie)
      })

      expect(result.current.isWatched(itemMovie.media_id, itemMovie.media_type)).toBe(true)
      expect(result.current.watchedList[0]).toMatchObject({
        media_id: itemMovie.media_id,
        media_type: itemMovie.media_type,
      })
      expect(upsertToSupabase).toHaveBeenCalled()
    })

    it('removes an item optimistically when it is already watched', async () => {
      const { triggerAuth } = captureAuthCallback()
      const user = makeUser()

      vi.mocked(hydrateWatched).mockResolvedValue([watchedEntry])
      Object.defineProperty(auth, 'currentUser', {
        value: user,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useWatched())

      await act(async () => {
        triggerAuth(user)
      })
      await waitFor(() => expect(result.current.watchedList).toEqual([watchedEntry]))

      await act(async () => {
        await result.current.toggleWatched(itemMovie)
      })

      expect(result.current.isWatched(itemMovie.media_id, itemMovie.media_type)).toBe(false)
      expect(deleteFromSupabase).toHaveBeenCalledWith(
        'mock-token',
        itemMovie.media_id,
        itemMovie.media_type
      )
    })

    it('rolls back state when upsertToSupabase fails', async () => {
      const { triggerAuth } = captureAuthCallback()
      const user = makeUser()

      // Use a deferred promise so we control when the failure arrives, allowing
      // the test to observe the optimistic state before the rollback fires.
      let rejectUpsert!: (err: Error) => void
      vi.mocked(upsertToSupabase).mockReturnValue(
        new Promise((_, reject) => { rejectUpsert = reject })
      )
      Object.defineProperty(auth, 'currentUser', {
        value: user,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useWatched())

      await act(async () => {
        triggerAuth(user)
      })
      await waitFor(() => expect(result.current.loading).toBe(false))

      // Optimistic add
      await act(async () => {
        await result.current.toggleWatched(itemMovie)
      })
      expect(result.current.isWatched(itemMovie.media_id, itemMovie.media_type)).toBe(true)

      // Trigger the sync failure — rollback should remove the item
      await act(async () => {
        rejectUpsert(new Error('Network error'))
        await Promise.resolve()
        await Promise.resolve()
      })

      await waitFor(() => {
        expect(result.current.isWatched(itemMovie.media_id, itemMovie.media_type)).toBe(false)
      })
    })

    it('does nothing when user is not authenticated', async () => {
      captureAuthCallback()
      // auth.currentUser stays null (default in beforeEach)

      const { result } = renderHook(() => useWatched())

      await act(async () => {
        await result.current.toggleWatched(itemMovie)
      })

      expect(result.current.watchedList).toEqual([])
      expect(upsertToSupabase).not.toHaveBeenCalled()
    })
  })
})
