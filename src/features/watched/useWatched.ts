import { useState, useCallback, useEffect, useRef } from 'react'
import { auth } from '@/features/auth/firebaseConfig'
import { onAuthStateChanged } from '@/features/auth/authService'
import { upsertToSupabase, deleteFromSupabase, hydrateWatched } from './store'
import type { WatchedItem, MediaType } from './store'

/**
 * React hook for managing the user's watched list as in-memory React state.
 * Auto-hydrates from Supabase on auth state changes and syncs mutations
 * back to Supabase (fire-and-forget).
 *
 * @returns Watched list state and action functions.
 */
export function useWatched() {
  const [watchedList, setWatchedList] = useState<WatchedItem[]>([])
  const [loading, setLoading] = useState(false)
  const userIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)

  // Hydrate from Supabase when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async user => {
      if (user && user.uid !== userIdRef.current) {
        userIdRef.current = user.uid
        setLoading(true)
        const token = await user.getIdToken()
        tokenRef.current = token
        const items = await hydrateWatched(token)
        setWatchedList(items)
        setLoading(false)
      } else if (!user) {
        userIdRef.current = null
        tokenRef.current = null
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
  const isWatched = useCallback(
    (mediaId: number, mediaType: MediaType): boolean => {
      return watchedList.some(w => w.media_id === mediaId && w.media_type === mediaType)
    },
    [watchedList]
  )

  /**
   * Toggles the watched state of a media item.
   * Adds it if not already watched; removes it if already watched.
   * @param item - The media item to toggle (without watched_at).
   */
  const toggleWatched = useCallback(
    async (item: Omit<WatchedItem, 'watched_at'>): Promise<void> => {
      const currentUser = auth.currentUser
      if (!currentUser) {
        console.warn('[cinescope] toggleWatched called without authenticated user')
        return
      }
      const token = await currentUser.getIdToken(false)
      if (!token) {
        console.warn('[cinescope] toggleWatched: could not obtain token')
        return
      }

      setWatchedList(prev => {
        const already = prev.some(
          w => w.media_id === item.media_id && w.media_type === item.media_type
        )
        if (already) {
          deleteFromSupabase(token, item.media_id, item.media_type).catch(err =>
            console.warn('[cinescope] Failed to delete watched item:', err)
          )
          return prev.filter(
            w => !(w.media_id === item.media_id && w.media_type === item.media_type)
          )
        } else {
          const entry: WatchedItem = { ...item, watched_at: new Date().toISOString() }
          upsertToSupabase(token, entry).catch(err =>
            console.warn('[cinescope] Failed to upsert watched item:', err)
          )
          return [entry, ...prev]
        }
      })
    },
    []
  )

  return {
    watchedList,
    isWatched,
    toggleWatched,
    loading,
  }
}
