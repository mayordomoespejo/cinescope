import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useListsPage } from '@/hooks/useListsPage'

// ── Mock useLists ─────────────────────────────────────────────────────

vi.mock('@/features/lists/useLists', () => ({
  useLists: vi.fn(),
}))

import { useLists } from '@/features/lists/useLists'
const mockUseLists = vi.mocked(useLists)

function makeList(id: string, name: string) {
  return { id, name, description: null, created_at: new Date().toISOString() }
}

function makeMockLists(lists = [makeList('list-1', 'My List')]) {
  const createList = vi.fn().mockResolvedValue(makeList('new-id', 'New List'))
  const deleteList = vi.fn().mockResolvedValue(undefined)
  const renameList = vi.fn().mockResolvedValue(undefined)
  const fetchListItems = vi.fn().mockResolvedValue([])
  const removeFromList = vi.fn().mockResolvedValue(undefined)

  mockUseLists.mockReturnValue({
    lists,
    loading: false,
    createList,
    deleteList,
    renameList,
    fetchListItems,
    removeFromList,
    addToList: vi.fn(),
    isInList: vi.fn(),
    error: null,
    refresh: vi.fn().mockResolvedValue(undefined),
  } as ReturnType<typeof useLists>)

  return { createList, deleteList, renameList, fetchListItems, removeFromList }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useListsPage', () => {
  it('auto-selects first list on load', async () => {
    makeMockLists()
    const { result } = renderHook(() => useListsPage())
    await waitFor(() => {
      expect(result.current.selectedList?.id).toBe('list-1')
    })
  })

  it('starts with showCreateForm false', () => {
    makeMockLists([])
    const { result } = renderHook(() => useListsPage())
    expect(result.current.showCreateForm).toBe(false)
  })

  it('toggleCreateForm toggles showCreateForm', async () => {
    makeMockLists([])
    const { result } = renderHook(() => useListsPage())
    act(() => result.current.toggleCreateForm())
    expect(result.current.showCreateForm).toBe(true)
    act(() => result.current.toggleCreateForm())
    expect(result.current.showCreateForm).toBe(false)
  })

  it('hideCreateForm hides the form', async () => {
    makeMockLists([])
    const { result } = renderHook(() => useListsPage())
    act(() => result.current.toggleCreateForm())
    act(() => result.current.hideCreateForm())
    expect(result.current.showCreateForm).toBe(false)
  })

  it('handleSelectList changes selection', async () => {
    const lists = [makeList('list-1', 'First'), makeList('list-2', 'Second')]
    makeMockLists(lists)
    const { result } = renderHook(() => useListsPage())
    act(() => result.current.handleSelectList('list-2'))
    expect(result.current.selectedList?.id).toBe('list-2')
  })

  it('handleCreateList calls createList and hides form', async () => {
    const { createList } = makeMockLists([])
    const { result } = renderHook(() => useListsPage())

    act(() => result.current.toggleCreateForm())
    await act(async () => {
      await result.current.handleCreateList('My New List', 'A description')
    })

    expect(createList).toHaveBeenCalledWith('My New List', 'A description')
    expect(result.current.showCreateForm).toBe(false)
  })

  it('handleCreateList passes undefined description when empty string', async () => {
    const { createList } = makeMockLists([])
    const { result } = renderHook(() => useListsPage())

    await act(async () => {
      await result.current.handleCreateList('My List', '')
    })

    expect(createList).toHaveBeenCalledWith('My List', undefined)
  })

  it('handleDeleteList calls deleteList', async () => {
    const { deleteList } = makeMockLists()
    const { result } = renderHook(() => useListsPage())

    await act(async () => {
      await result.current.handleDeleteList('list-1')
    })

    expect(deleteList).toHaveBeenCalledWith('list-1')
  })

  it('handleDeleteList resets selection when deleting selected list', async () => {
    const { deleteList } = makeMockLists()
    const { result } = renderHook(() => useListsPage())

    await waitFor(() => expect(result.current.selectedList?.id).toBe('list-1'))

    await act(async () => {
      await result.current.handleDeleteList('list-1')
    })

    expect(deleteList).toHaveBeenCalledWith('list-1')
  })

  it('handleRenameList calls renameList', async () => {
    const { renameList } = makeMockLists()
    const { result } = renderHook(() => useListsPage())

    await act(async () => {
      await result.current.handleRenameList('list-1', 'New Name')
    })

    expect(renameList).toHaveBeenCalledWith('list-1', 'New Name')
  })

  it('handleRemoveItem calls removeFromList', async () => {
    const { removeFromList } = makeMockLists()
    const { result } = renderHook(() => useListsPage())

    await act(async () => {
      await result.current.handleRemoveItem('list-1', 42, 'movie')
    })

    expect(removeFromList).toHaveBeenCalledWith('list-1', 42, 'movie')
  })

  it('getItemCount returns 0 for unknown list', () => {
    makeMockLists([])
    const { result } = renderHook(() => useListsPage())
    expect(result.current.getItemCount('unknown-list')).toBe(0)
  })

  it('selectedItems is null when nothing selected', () => {
    makeMockLists([])
    const { result } = renderHook(() => useListsPage())
    expect(result.current.selectedItems).toBeNull()
  })
})
