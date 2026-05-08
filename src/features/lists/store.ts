import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import type { MediaType } from '@/lib/types'

export const LISTS_PERSIST_KEY = 'cinescope-lists'

// ── Types ────────────────────────────────────────────────────────────

/** A user-created custom list stored locally. */
export interface CinescopeList {
  id: string
  name: string
  description: string | null
  created_at: string
}

/** A media item stored inside a list. */
export interface ListItem {
  list_id: string
  media_id: number
  media_type: MediaType
  /** Full TMDB object serialised as JSON. */
  media_data: Movie | TVShow
  added_at: string
}

// ── Store ────────────────────────────────────────────────────────────

interface ListsState {
  lists: CinescopeList[]
  items: ListItem[]
  createList: (name: string, description?: string) => CinescopeList
  deleteList: (listId: string) => void
  renameList: (listId: string, name: string) => CinescopeList
  addToList: (
    listId: string,
    item: { media_id: number; media_type: MediaType; media_data: Movie | TVShow }
  ) => void
  removeFromList: (listId: string, mediaId: number, mediaType: MediaType) => void
  isInList: (listId: string, mediaId: number, mediaType: MediaType) => boolean
  fetchListItems: (listId: string) => ListItem[]
}

/**
 * Zustand store for custom lists and their items, persisted to localStorage
 * under the key `cinescope-lists`.
 *
 * List IDs are generated with `crypto.randomUUID()`.
 */
export const useListsStore = create<ListsState>()(
  persist(
    (set, get) => ({
      lists: [],
      items: [],

      createList: (name: string, description?: string): CinescopeList => {
        const newList: CinescopeList = {
          id: crypto.randomUUID(),
          name: name.trim(),
          description: description?.trim() ?? null,
          created_at: new Date().toISOString(),
        }
        set(state => ({ lists: [newList, ...state.lists] }))
        return newList
      },

      deleteList: (listId: string) => {
        set(state => ({
          lists: state.lists.filter(l => l.id !== listId),
          items: state.items.filter(i => i.list_id !== listId),
        }))
      },

      renameList: (listId: string, name: string): CinescopeList => {
        let updated!: CinescopeList
        set(state => {
          const lists = state.lists.map(l => {
            if (l.id !== listId) return l
            updated = { ...l, name: name.trim() }
            return updated
          })
          return { lists }
        })
        return updated
      },

      addToList: (
        listId: string,
        item: { media_id: number; media_type: MediaType; media_data: Movie | TVShow }
      ) => {
        set(state => {
          const alreadyIn = state.items.some(
            i =>
              i.list_id === listId &&
              i.media_id === item.media_id &&
              i.media_type === item.media_type
          )
          if (alreadyIn) return {}
          const newItem: ListItem = {
            list_id: listId,
            media_id: item.media_id,
            media_type: item.media_type,
            media_data: item.media_data,
            added_at: new Date().toISOString(),
          }
          return { items: [newItem, ...state.items] }
        })
      },

      removeFromList: (listId: string, mediaId: number, mediaType: MediaType) => {
        set(state => ({
          items: state.items.filter(
            i => !(i.list_id === listId && i.media_id === mediaId && i.media_type === mediaType)
          ),
        }))
      },

      isInList: (listId: string, mediaId: number, mediaType: MediaType): boolean => {
        return get().items.some(
          i => i.list_id === listId && i.media_id === mediaId && i.media_type === mediaType
        )
      },

      fetchListItems: (listId: string): ListItem[] => {
        return get()
          .items.filter(i => i.list_id === listId)
          .sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
      },
    }),
    {
      name: LISTS_PERSIST_KEY,
    }
  )
)
