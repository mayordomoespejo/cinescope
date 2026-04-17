import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  fetchLists,
  createList,
  deleteList,
  renameList,
  addToList,
  removeFromList,
  isInList,
  fetchListItems,
  type CinescopeList,
  type ListItem,
} from './store'

interface UseListsReturn {
  lists: CinescopeList[]
  loading: boolean
  error: Error | null
  createList: (name: string, description?: string) => Promise<CinescopeList>
  deleteList: (listId: string) => Promise<void>
  renameList: (listId: string, name: string) => Promise<void>
  addToList: (
    listId: string,
    item: { media_id: number; media_type: 'movie' | 'tv'; media_data: Record<string, unknown> }
  ) => Promise<void>
  removeFromList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>
  isInList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<boolean>
  fetchListItems: (listId: string) => Promise<ListItem[]>
  refresh: () => Promise<void>
}

/**
 * React hook for managing user custom lists.
 * Auto-fetches lists when auth state changes.
 * @returns Lists state and CRUD action callbacks.
 */
export function useLists(): UseListsReturn {
  const { user } = useAuth()
  const [lists, setLists] = useState<CinescopeList[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadLists = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLists(userId)
      setLists(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.uid) {
      void loadLists(user.uid)
    } else {
      setLists([])
    }
  }, [user?.uid, loadLists])

  const refresh = useCallback(async () => {
    if (user?.uid) await loadLists(user.uid)
  }, [user?.uid, loadLists])

  const handleCreateList = useCallback(
    async (name: string, description?: string) => {
      if (!user?.uid) throw new Error('Not authenticated')
      const newList = await createList(user.uid, name, description)
      setLists(prev => [newList, ...prev])
      return newList
    },
    [user?.uid]
  )

  const handleDeleteList = useCallback(async (listId: string) => {
    await deleteList(listId)
    setLists(prev => prev.filter(l => l.id !== listId))
  }, [])

  const handleRenameList = useCallback(async (listId: string, name: string) => {
    const updated = await renameList(listId, name)
    setLists(prev => prev.map(l => (l.id === listId ? updated : l)))
  }, [])

  const handleAddToList = useCallback(
    async (
      listId: string,
      item: { media_id: number; media_type: 'movie' | 'tv'; media_data: Record<string, unknown> }
    ) => {
      await addToList(listId, item)
    },
    []
  )

  const handleRemoveFromList = useCallback(
    async (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
      await removeFromList(listId, mediaId, mediaType)
    },
    []
  )

  const handleIsInList = useCallback(
    async (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
      return isInList(listId, mediaId, mediaType)
    },
    []
  )

  const handleFetchListItems = useCallback(async (listId: string) => {
    return fetchListItems(listId)
  }, [])

  return {
    lists,
    loading,
    error,
    createList: handleCreateList,
    deleteList: handleDeleteList,
    renameList: handleRenameList,
    addToList: handleAddToList,
    removeFromList: handleRemoveFromList,
    isInList: handleIsInList,
    fetchListItems: handleFetchListItems,
    refresh,
  }
}
