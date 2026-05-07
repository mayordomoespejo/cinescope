import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import type { MediaType } from '@/lib/types'

export type { MediaType }

/** Unified media item stored in the watched list. */
export interface WatchedItem {
  media_id: number
  media_type: MediaType
  media_data: Movie | TVShow
  watched_at: string
}

// ── Watched store (persisted to localStorage) ───────────────────────

interface WatchedState {
  watchedList: WatchedItem[]
  toggleWatched: (item: Omit<WatchedItem, 'watched_at'>) => void
  isWatched: (mediaId: number, mediaType: MediaType) => boolean
}

/**
 * Zustand store for the user's watched history, persisted to localStorage
 * under the key `cinescope-watched`.
 */
export const useWatchedStore = create<WatchedState>()(
  persist(
    (set, get) => ({
      watchedList: [],

      toggleWatched: (item: Omit<WatchedItem, 'watched_at'>) => {
        set(state => {
          const already = state.watchedList.some(
            w => w.media_id === item.media_id && w.media_type === item.media_type
          )
          if (already) {
            return {
              watchedList: state.watchedList.filter(
                w => !(w.media_id === item.media_id && w.media_type === item.media_type)
              ),
            }
          }
          const entry: WatchedItem = { ...item, watched_at: new Date().toISOString() }
          return { watchedList: [entry, ...state.watchedList] }
        })
      },

      isWatched: (mediaId: number, mediaType: MediaType) =>
        get().watchedList.some(w => w.media_id === mediaId && w.media_type === mediaType),
    }),
    {
      name: 'cinescope-watched',
    }
  )
)
