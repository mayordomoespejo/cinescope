import { useState, useEffect, useRef, useCallback } from 'react'
import { useLists } from '@/features/lists/useLists'
import type { CinescopeList, ListItem } from '@/features/lists/store'

// ── Types ──────────────────────────────────────────────────────────────────

export interface UseListsPageReturn {
  /** All user-created lists from the store. */
  lists: CinescopeList[]
  /** True while the initial lists fetch is in-flight. */
  loading: boolean
  /** Currently selected list, or `null` when nothing is selected. */
  selectedList: CinescopeList | null
  /** Items for the selected list, or `null` if not yet fetched. */
  selectedItems: ListItem[] | null
  /** True while items for the selected list are being fetched. */
  itemsLoading: boolean
  /** Whether the create-list form is visible. */
  showCreateForm: boolean
  /** Returns the number of cached items for `listId`. */
  getItemCount: (listId: string) => number
  /** Selects a list by its ID. */
  handleSelectList: (listId: string) => void
  /** Creates a list, then selects it and hides the form. */
  handleCreateList: (name: string, description: string) => Promise<void>
  /** Deletes a list and adjusts selection. */
  handleDeleteList: (listId: string) => Promise<void>
  /** Renames a list. */
  handleRenameList: (listId: string, newName: string) => Promise<void>
  /** Removes a single item from a list and updates local cache. */
  handleRemoveItem: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>
  /** Toggles the create-list form visibility. */
  toggleCreateForm: () => void
  /** Hides the create-list form. */
  hideCreateForm: () => void
}

// ── Hook ──────────────────────────────────────────────────────────────────

/**
 * Encapsulates all state management and side-effect handlers for
 * {@link ListsPage}. Keeps the page component as a pure layout/render shell.
 */
export function useListsPage(): UseListsPageReturn {
  const { lists, loading, createList, deleteList, renameList, fetchListItems, removeFromList } =
    useLists()

  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [itemsByList, setItemsByList] = useState<Record<string, ListItem[]>>({})
  const [itemsLoading, setItemsLoading] = useState(false)

  // Auto-select the first list when the list data arrives.
  useEffect(() => {
    if (!selectedListId && lists.length > 0) {
      setSelectedListId(lists[0].id)
    }
  }, [lists, selectedListId])

  // Stable ref to avoid stale closures inside `loadItems`.
  const itemsByListRef = useRef(itemsByList)
  itemsByListRef.current = itemsByList

  const loadItems = useCallback(
    async (listId: string) => {
      if (itemsByListRef.current[listId]) return // already cached
      setItemsLoading(true)
      try {
        const items = await fetchListItems(listId)
        setItemsByList(prev => ({ ...prev, [listId]: items }))
      } finally {
        setItemsLoading(false)
      }
    },
    [fetchListItems]
  )

  useEffect(() => {
    if (selectedListId) void loadItems(selectedListId)
  }, [selectedListId, loadItems])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectList = (listId: string) => {
    setSelectedListId(listId)
  }

  const handleCreateList = async (name: string, description: string) => {
    const newList = await createList(name, description || undefined)
    setShowCreateForm(false)
    setSelectedListId(newList.id)
    setItemsByList(prev => ({ ...prev, [newList.id]: [] }))
  }

  const handleDeleteList = async (listId: string) => {
    await deleteList(listId)
    if (selectedListId === listId) {
      const remaining = lists.filter(l => l.id !== listId)
      setSelectedListId(remaining.length > 0 ? remaining[0].id : null)
    }
    setItemsByList(prev => {
      const next = { ...prev }
      delete next[listId]
      return next
    })
  }

  const handleRenameList = async (listId: string, newName: string) => {
    await renameList(listId, newName)
  }

  const handleRemoveItem = async (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
    await removeFromList(listId, mediaId, mediaType)
    setItemsByList(prev => ({
      ...prev,
      [listId]: (prev[listId] ?? []).filter(
        it => !(it.media_id === mediaId && it.media_type === mediaType)
      ),
    }))
  }

  // ── Derived values ───────────────────────────────────────────────────────

  const selectedList = lists.find(l => l.id === selectedListId) ?? null
  const selectedItems = selectedListId ? (itemsByList[selectedListId] ?? null) : null
  const getItemCount = (listId: string): number => itemsByList[listId]?.length ?? 0

  return {
    lists,
    loading,
    selectedList,
    selectedItems,
    itemsLoading,
    showCreateForm,
    getItemCount,
    handleSelectList,
    handleCreateList,
    handleDeleteList,
    handleRenameList,
    handleRemoveItem,
    toggleCreateForm: () => setShowCreateForm(v => !v),
    hideCreateForm: () => setShowCreateForm(false),
  }
}
