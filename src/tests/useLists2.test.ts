/**
 * Tests for useLists hook (the async wrapper around useListsStore).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLists } from '@/features/lists/useLists'
import { useListsStore } from '@/features/lists/store'

beforeEach(() => {
  useListsStore.setState({ lists: [], items: [] })
  localStorage.clear()
})

describe('useLists', () => {
  it('starts with empty lists and loading=false', () => {
    const { result } = renderHook(() => useLists())
    expect(result.current.lists).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('createList adds a list', async () => {
    const { result } = renderHook(() => useLists())
    let newList: Awaited<ReturnType<typeof result.current.createList>>
    await act(async () => {
      newList = await result.current.createList('Test List')
    })
    expect(result.current.lists).toHaveLength(1)
    expect(result.current.lists[0].name).toBe('Test List')
    expect(newList!.name).toBe('Test List')
  })

  it('createList with description', async () => {
    const { result } = renderHook(() => useLists())
    await act(async () => {
      await result.current.createList('My List', 'A description')
    })
    expect(result.current.lists[0].description).toBe('A description')
  })

  it('deleteList removes a list', async () => {
    const { result } = renderHook(() => useLists())
    let id: string
    await act(async () => {
      const list = await result.current.createList('To Delete')
      id = list.id
    })
    await act(async () => {
      await result.current.deleteList(id!)
    })
    expect(result.current.lists).toHaveLength(0)
  })

  it('renameList renames a list', async () => {
    const { result } = renderHook(() => useLists())
    let id: string
    await act(async () => {
      const list = await result.current.createList('Old Name')
      id = list.id
    })
    await act(async () => {
      await result.current.renameList(id!, 'New Name')
    })
    expect(result.current.lists[0].name).toBe('New Name')
  })

  it('addToList adds an item', async () => {
    const { result } = renderHook(() => useLists())
    let id: string
    await act(async () => {
      const list = await result.current.createList('My List')
      id = list.id
    })
    await act(async () => {
      await result.current.addToList(id!, {
        media_id: 1,
        media_type: 'movie',
        media_data: {},
      })
    })
    const items = useListsStore.getState().items
    expect(items).toHaveLength(1)
  })

  it('removeFromList removes an item', async () => {
    const { result } = renderHook(() => useLists())
    let id: string
    await act(async () => {
      const list = await result.current.createList('My List')
      id = list.id
    })
    await act(async () => {
      await result.current.addToList(id!, { media_id: 5, media_type: 'movie', media_data: {} })
    })
    await act(async () => {
      await result.current.removeFromList(id!, 5, 'movie')
    })
    expect(useListsStore.getState().items).toHaveLength(0)
  })

  it('isInList returns true when item exists', async () => {
    const { result } = renderHook(() => useLists())
    let id: string
    await act(async () => {
      const list = await result.current.createList('My List')
      id = list.id
    })
    await act(async () => {
      await result.current.addToList(id!, { media_id: 5, media_type: 'movie', media_data: {} })
    })
    const inList = await result.current.isInList(id!, 5, 'movie')
    expect(inList).toBe(true)
  })

  it('isInList returns false when item does not exist', async () => {
    const { result } = renderHook(() => useLists())
    let id: string
    await act(async () => {
      const list = await result.current.createList('My List')
      id = list.id
    })
    const inList = await result.current.isInList(id!, 99, 'movie')
    expect(inList).toBe(false)
  })

  it('fetchListItems returns items for list', async () => {
    const { result } = renderHook(() => useLists())
    let id: string
    await act(async () => {
      const list = await result.current.createList('My List')
      id = list.id
    })
    await act(async () => {
      await result.current.addToList(id!, { media_id: 1, media_type: 'movie', media_data: {} })
    })
    const items = await result.current.fetchListItems(id!)
    expect(items).toHaveLength(1)
  })

  it('refresh is a no-op', async () => {
    const { result } = renderHook(() => useLists())
    await expect(result.current.refresh()).resolves.toBeUndefined()
  })
})
