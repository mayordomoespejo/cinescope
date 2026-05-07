import { useShallow } from 'zustand/react/shallow'
import { useListsStore } from './store'
import type { CinescopeList, ListItem } from './store'

export type { CinescopeList, ListItem }

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
 * State is persisted to localStorage via Zustand `persist` middleware.
 * @returns Lists state and CRUD action callbacks.
 */
export function useLists(): UseListsReturn {
  const {
    lists,
    storeCreate,
    storeDelete,
    storeRename,
    storeAdd,
    storeRemove,
    storeIsInList,
    storeFetchItems,
  } = useListsStore(
    useShallow(s => ({
      lists: s.lists,
      storeCreate: s.createList,
      storeDelete: s.deleteList,
      storeRename: s.renameList,
      storeAdd: s.addToList,
      storeRemove: s.removeFromList,
      storeIsInList: s.isInList,
      storeFetchItems: s.fetchListItems,
    }))
  )

  return {
    lists,
    loading: false,
    error: null,

    createList: async (name: string, description?: string) => storeCreate(name, description),

    deleteList: async (listId: string) => {
      storeDelete(listId)
    },

    renameList: async (listId: string, name: string) => {
      storeRename(listId, name)
    },

    addToList: async (
      listId: string,
      item: { media_id: number; media_type: 'movie' | 'tv'; media_data: Record<string, unknown> }
    ) => {
      storeAdd(listId, item)
    },

    removeFromList: async (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
      storeRemove(listId, mediaId, mediaType)
    },

    isInList: async (listId: string, mediaId: number, mediaType: 'movie' | 'tv') =>
      storeIsInList(listId, mediaId, mediaType),

    fetchListItems: async (listId: string) => storeFetchItems(listId),

    refresh: async () => {
      /* no-op — data is local, always up to date */
    },
  }
}
