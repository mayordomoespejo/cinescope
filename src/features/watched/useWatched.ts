import { useWatchedStore } from './store'
import type { WatchedItem, MediaType } from './store'

export type { WatchedItem, MediaType }

/**
 * React hook for managing the user's watched list.
 * State is persisted to localStorage via Zustand `persist` middleware.
 * @returns Watched list state and action functions.
 */
export function useWatched() {
  const watchedList = useWatchedStore(s => s.watchedList)
  const toggleWatched = useWatchedStore(s => s.toggleWatched)
  const isWatched = useWatchedStore(s => s.isWatched)

  return {
    watchedList,
    isWatched,
    toggleWatched,
  }
}
