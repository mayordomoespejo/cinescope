import { useShallow } from 'zustand/react/shallow'
import { useListsStore } from './store'
import type { CinescopeList, ListItem } from './store'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'

export type { CinescopeList, ListItem }

interface UseListsReturn {
  lists: CinescopeList[]
  createList: (name: string, description?: string) => CinescopeList
  deleteList: (listId: string) => void
  renameList: (listId: string, name: string) => void
  addToList: (
    listId: string,
    item: { media_id: number; media_type: 'movie' | 'tv'; media_data: Movie | TVShow }
  ) => void
  removeFromList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => void
  isInList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => boolean
  fetchListItems: (listId: string) => ListItem[]
  refresh: () => void
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

    createList: (name: string, description?: string) => storeCreate(name, description),

    deleteList: (listId: string) => {
      storeDelete(listId)
    },

    renameList: (listId: string, name: string) => {
      storeRename(listId, name)
    },

    addToList: (
      listId: string,
      item: { media_id: number; media_type: 'movie' | 'tv'; media_data: Movie | TVShow }
    ) => {
      storeAdd(listId, item)
    },

    removeFromList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
      storeRemove(listId, mediaId, mediaType)
    },

    isInList: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') =>
      storeIsInList(listId, mediaId, mediaType),

    fetchListItems: (listId: string) => storeFetchItems(listId),

    refresh: () => {
      /* no-op — data is local, always up to date */
    },
  }
}
