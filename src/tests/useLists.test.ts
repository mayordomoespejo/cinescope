import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLists } from '@/features/lists/useLists'
import type { CinescopeList } from '@/features/lists/store'

// ── Module mocks ─────────────────────────────────────────────────────

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/features/lists/store', () => ({
  fetchLists: vi.fn(),
  createList: vi.fn(),
  deleteList: vi.fn(),
  renameList: vi.fn(),
  addToList: vi.fn(),
  removeFromList: vi.fn(),
  isInList: vi.fn(),
  fetchListItems: vi.fn(),
}))

import { useAuth } from '@/features/auth/useAuth'
import {
  fetchLists,
  createList,
  deleteList,
  renameList,
  addToList,
  removeFromList,
} from '@/features/lists/store'

// ── Helpers ───────────────────────────────────────────────────────────

function makeUser(uid = 'user-1') {
  return { uid }
}

function makeList(overrides: Partial<CinescopeList> = {}): CinescopeList {
  return {
    id: 'list-1',
    user_id: 'user-1',
    name: 'My List',
    description: null,
    created_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('useLists', () => {
  beforeEach(() => {
    vi.mocked(fetchLists).mockResolvedValue([])
    vi.mocked(createList).mockResolvedValue(makeList())
    vi.mocked(deleteList).mockResolvedValue(undefined)
    vi.mocked(renameList).mockResolvedValue(makeList({ name: 'Renamed' }))
    vi.mocked(addToList).mockResolvedValue(undefined)
    vi.mocked(removeFromList).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ── getLists ─────────────────────────────────────────────────────────

  describe('getLists()', () => {
    it('returns empty array when no lists exist', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: makeUser() } as ReturnType<typeof useAuth>)
      vi.mocked(fetchLists).mockResolvedValue([])

      const { result } = renderHook(() => useLists())

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(result.current.lists).toEqual([])
    })

    it('loads lists from store when user is authenticated', async () => {
      const list = makeList()
      vi.mocked(useAuth).mockReturnValue({ user: makeUser() } as ReturnType<typeof useAuth>)
      vi.mocked(fetchLists).mockResolvedValue([list])

      const { result } = renderHook(() => useLists())

      await waitFor(() => {
        expect(result.current.lists).toEqual([list])
        expect(result.current.loading).toBe(false)
      })

      expect(fetchLists).toHaveBeenCalledWith('user-1')
    })

    it('does not call fetchLists when user is null', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>)

      const { result } = renderHook(() => useLists())

      // Short wait to confirm no async load fires
      await new Promise(r => setTimeout(r, 10))

      expect(result.current.lists).toEqual([])
      expect(fetchLists).not.toHaveBeenCalled()
    })

    it('sets error when fetchLists rejects', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: makeUser() } as ReturnType<typeof useAuth>)
      vi.mocked(fetchLists).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useLists())

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(result.current.error).not.toBeNull()
      expect(result.current.lists).toEqual([])
    })
  })

  // ── createList ───────────────────────────────────────────────────────

  describe('createList()', () => {
    it('adds a new list and prepends it to state', async () => {
      const newList = makeList({ id: 'list-new', name: 'Thriller Films' })
      vi.mocked(useAuth).mockReturnValue({ user: makeUser() } as ReturnType<typeof useAuth>)
      vi.mocked(createList).mockResolvedValue(newList)

      const { result } = renderHook(() => useLists())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.createList('Thriller Films')
      })

      expect(result.current.lists[0]).toEqual(newList)
      expect(createList).toHaveBeenCalledWith('user-1', 'Thriller Films', undefined)
    })

    it('throws and leaves state unchanged when createList fails', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: makeUser() } as ReturnType<typeof useAuth>)
      vi.mocked(fetchLists).mockResolvedValue([makeList()])
      vi.mocked(createList).mockRejectedValue(new Error('DB error'))

      const { result } = renderHook(() => useLists())
      await waitFor(() => expect(result.current.lists).toHaveLength(1))

      await act(async () => {
        await expect(result.current.createList('Should Fail')).rejects.toThrow('DB error')
      })

      // Original list should still be there — no partial mutation
      expect(result.current.lists).toHaveLength(1)
    })

    it('throws when user is not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>)

      const { result } = renderHook(() => useLists())

      await act(async () => {
        await expect(result.current.createList('Not Allowed')).rejects.toThrow('Not authenticated')
      })

      expect(createList).not.toHaveBeenCalled()
    })
  })

  // ── deleteList ───────────────────────────────────────────────────────

  describe('deleteList()', () => {
    it('removes the list from state after deleting', async () => {
      const list = makeList()
      vi.mocked(useAuth).mockReturnValue({ user: makeUser() } as ReturnType<typeof useAuth>)
      vi.mocked(fetchLists).mockResolvedValue([list])

      const { result } = renderHook(() => useLists())
      await waitFor(() => expect(result.current.lists).toHaveLength(1))

      await act(async () => {
        await result.current.deleteList(list.id)
      })

      expect(result.current.lists).toHaveLength(0)
      expect(deleteList).toHaveBeenCalledWith(list.id)
    })
  })

  // ── renameList ───────────────────────────────────────────────────────

  describe('renameList()', () => {
    it('updates the list name in state', async () => {
      const list = makeList()
      const renamed = makeList({ name: 'Best Sci-Fi' })
      vi.mocked(useAuth).mockReturnValue({ user: makeUser() } as ReturnType<typeof useAuth>)
      vi.mocked(fetchLists).mockResolvedValue([list])
      vi.mocked(renameList).mockResolvedValue(renamed)

      const { result } = renderHook(() => useLists())
      await waitFor(() => expect(result.current.lists).toHaveLength(1))

      await act(async () => {
        await result.current.renameList(list.id, 'Best Sci-Fi')
      })

      expect(result.current.lists[0].name).toBe('Best Sci-Fi')
      expect(renameList).toHaveBeenCalledWith(list.id, 'Best Sci-Fi')
    })
  })

  // ── addToList ────────────────────────────────────────────────────────

  describe('addToList()', () => {
    it('calls store addToList with the correct arguments', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: makeUser() } as ReturnType<typeof useAuth>)

      const { result } = renderHook(() => useLists())
      await waitFor(() => expect(result.current.loading).toBe(false))

      const item = {
        media_id: 42,
        media_type: 'movie' as const,
        media_data: {
          id: 42,
          title: 'Inception',
          overview: '',
          poster_path: null,
          backdrop_path: null,
          release_date: '2010-07-16',
          vote_average: 8.4,
          vote_count: 30000,
          genre_ids: [28, 878],
          popularity: 100,
          adult: false,
          original_language: 'en',
          original_title: 'Inception',
        },
      }

      await act(async () => {
        await result.current.addToList('list-1', item)
      })

      expect(addToList).toHaveBeenCalledWith('list-1', item)
    })
  })

  // ── removeFromList ───────────────────────────────────────────────────

  describe('removeFromList()', () => {
    it('calls store removeFromList with the correct arguments', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: makeUser() } as ReturnType<typeof useAuth>)

      const { result } = renderHook(() => useLists())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.removeFromList('list-1', 42, 'movie')
      })

      expect(removeFromList).toHaveBeenCalledWith('list-1', 42, 'movie')
    })
  })
})
