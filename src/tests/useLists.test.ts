import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLists } from '@/features/lists/useLists'
import { useListsStore } from '@/features/lists/store'
import type { CinescopeList } from '@/features/lists/store'

function makeList(overrides: Partial<CinescopeList> = {}): CinescopeList {
  return {
    id: 'list-1',
    name: 'My List',
    description: null,
    created_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  useListsStore.setState({ lists: [], items: [] })
  localStorage.clear()
})

describe('useLists', () => {
  describe('initial state', () => {
    it('starts with empty lists', () => {
      const { result } = renderHook(() => useLists())
      expect(result.current.lists).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('createList()', () => {
    it('adds a new list to state', async () => {
      const { result } = renderHook(() => useLists())

      await act(async () => {
        await result.current.createList('Thriller Films')
      })

      expect(result.current.lists).toHaveLength(1)
      expect(result.current.lists[0].name).toBe('Thriller Films')
    })

    it('prepends the new list', async () => {
      useListsStore.setState({ lists: [makeList({ name: 'First' })], items: [] })
      const { result } = renderHook(() => useLists())

      await act(async () => {
        await result.current.createList('Second')
      })

      expect(result.current.lists[0].name).toBe('Second')
    })

    it('trims whitespace from the name', async () => {
      const { result } = renderHook(() => useLists())

      await act(async () => {
        await result.current.createList('  Sci-Fi  ')
      })

      expect(result.current.lists[0].name).toBe('Sci-Fi')
    })
  })

  describe('deleteList()', () => {
    it('removes the list from state', async () => {
      const list = makeList()
      useListsStore.setState({ lists: [list], items: [] })
      const { result } = renderHook(() => useLists())

      await act(async () => {
        await result.current.deleteList(list.id)
      })

      expect(result.current.lists).toHaveLength(0)
    })
  })

  describe('renameList()', () => {
    it('updates the list name in state', async () => {
      const list = makeList()
      useListsStore.setState({ lists: [list], items: [] })
      const { result } = renderHook(() => useLists())

      await act(async () => {
        await result.current.renameList(list.id, 'Best Sci-Fi')
      })

      expect(result.current.lists[0].name).toBe('Best Sci-Fi')
    })
  })

  describe('addToList() / removeFromList() / isInList()', () => {
    it('adds an item and isInList returns true', async () => {
      const list = makeList()
      useListsStore.setState({ lists: [list], items: [] })
      const { result } = renderHook(() => useLists())

      const item = {
        media_id: 42,
        media_type: 'movie' as const,
        media_data: { id: 42, title: 'Inception' },
      }

      await act(async () => {
        await result.current.addToList(list.id, item)
      })

      const inList = await result.current.isInList(list.id, 42, 'movie')
      expect(inList).toBe(true)
    })

    it('removes an item and isInList returns false', async () => {
      const list = makeList()
      useListsStore.setState({
        lists: [list],
        items: [
          {
            list_id: list.id,
            media_id: 42,
            media_type: 'movie',
            media_data: {},
            added_at: '2024-01-01T00:00:00.000Z',
          },
        ],
      })
      const { result } = renderHook(() => useLists())

      await act(async () => {
        await result.current.removeFromList(list.id, 42, 'movie')
      })

      const inList = await result.current.isInList(list.id, 42, 'movie')
      expect(inList).toBe(false)
    })
  })

  describe('fetchListItems()', () => {
    it('returns only items belonging to the requested list', async () => {
      const list = makeList()
      useListsStore.setState({
        lists: [list],
        items: [
          {
            list_id: list.id,
            media_id: 1,
            media_type: 'movie',
            media_data: {},
            added_at: '2024-01-01T00:00:00.000Z',
          },
          {
            list_id: 'other-list',
            media_id: 2,
            media_type: 'tv',
            media_data: {},
            added_at: '2024-01-02T00:00:00.000Z',
          },
        ],
      })
      const { result } = renderHook(() => useLists())

      const items = await result.current.fetchListItems(list.id)
      expect(items).toHaveLength(1)
      expect(items[0].media_id).toBe(1)
    })
  })
})
