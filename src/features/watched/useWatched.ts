import { useState, useCallback, useEffect, useRef } from 'react'
import { onAuthStateChanged } from '@/features/auth/authService'
import {
  getWatchedList,
  addWatched,
  removeWatched,
  isWatched as isWatchedStore,
  hydrateWatched,
} from './store'
import type { WatchedItem, MediaType } from './store'

/**
 * React hook for managing the user's watched list.
 * Auto-hydrates from Supabase on auth state changes and syncs across tabs
 * via the `cinescope:watched-change` storage event.
 *
 * @returns Watched list state and action functions.
 */
export function useWatched() {
  const [watchedList, setWatchedList] = useState<WatchedItem[]>(getWatchedList)
  const [loading, setLoading] = useState(false)
  const userIdRef = useRef<string | null>(null)

  // Sync local state when localStorage changes (e.g. after hydration)
  useEffect(() => {
    const sync = () => setWatchedList(getWatchedList())
    window.addEventListener('cinescope:watched-change', sync)
    return () => window.removeEventListener('cinescope:watched-change', sync)
  }, [])

  // Hydrate from Supabase when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async user => {
      if (user && user.uid !== userIdRef.current) {
        userIdRef.current = user.uid
        setLoading(true)
        await hydrateWatched(user.uid)
        setLoading(false)
      } else if (!user) {
        userIdRef.current = null
        setWatchedList([])
      }
    })
    return unsubscribe
  }, [])

  /**
   * Checks whether a media item is in the watched list.
   * @param mediaId - TMDB media ID.
   * @param mediaType - Media type ('movie' or 'tv').
   */
  const isWatched = useCallback((mediaId: number, mediaType: MediaType): boolean => {
    return isWatchedStore(mediaId, mediaType)
  }, [])

  /**
   * Toggles the watched state of a media item.
   * Adds it if not already watched; removes it if already watched.
   * @param item - The media item to toggle (without watched_at).
   */
  const toggleWatched = useCallback((item: Omit<WatchedItem, 'watched_at'>): void => {
    const userId = userIdRef.current
    if (!userId) return

    if (isWatchedStore(item.media_id, item.media_type)) {
      removeWatched(userId, item.media_id, item.media_type)
    } else {
      addWatched(userId, item)
    }
    setWatchedList(getWatchedList())
  }, [])

  return {
    watchedList,
    isWatched,
    toggleWatched,
    loading,
  }
}
