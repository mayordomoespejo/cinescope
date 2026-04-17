import { useState, useCallback, useEffect, useRef } from 'react'
import { auth } from '@/features/auth/firebaseConfig'
import { onAuthStateChanged } from '@/features/auth/authService'
import { upsertToSupabase, deleteFromSupabase, hydrateWatched } from './store'
import type { WatchedItem, MediaType } from './store'

/**
 * React hook for managing the user's watched list as in-memory React state.
 * Auto-hydrates from Supabase on auth state changes and syncs mutations
 * back to Supabase (fire-and-forget).
 * Exposes `syncError` when a Supabase sync fails so callers can surface it.
 *
 * @returns Watched list state and action functions.
 */
export function useWatched() {
  const [watchedList, setWatchedList] = useState<WatchedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [syncError, setSyncError] = useState<Error | null>(null)
  const userIdRef = useRef<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  // Hydrate from Supabase when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async user => {
      if (user && user.uid !== userIdRef.current) {
        userIdRef.current = user.uid
        // Abort any in-flight hydration for a previous user
        controllerRef.current?.abort()
        const controller = new AbortController()
        controllerRef.current = controller

        setLoading(true)
        setSyncError(null)
        try {
          const token = await user.getIdToken()
          if (controller.signal.aborted) return
          tokenRef.current = token
          const items = await hydrateWatched(token, controller.signal)
          if (controller.signal.aborted) return
          setWatchedList(items)
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.warn('[cinescope] Failed to hydrate watched:', err)
            setSyncError(err instanceof Error ? err : new Error(String(err)))
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false)
        }
      } else if (!user) {
        userIdRef.current = null
        tokenRef.current = null
        controllerRef.current?.abort()
        setWatchedList([])
        setSyncError(null)
      }
    })
    return () => {
      unsubscribe()
      controllerRef.current?.abort()
    }
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

      setSyncError(null)
      setWatchedList(prev => {
        const already = prev.some(
          w => w.media_id === item.media_id && w.media_type === item.media_type
        )
        if (already) {
          deleteFromSupabase(token, item.media_id, item.media_type).catch(err => {
            console.warn('[cinescope] Failed to delete watched item:', err)
            setSyncError(err instanceof Error ? err : new Error(String(err)))
            // Rollback to previous state on sync failure
            setWatchedList(prev)
          })
          return prev.filter(
            w => !(w.media_id === item.media_id && w.media_type === item.media_type)
          )
        } else {
          const entry: WatchedItem = { ...item, watched_at: new Date().toISOString() }
          upsertToSupabase(token, entry).catch(err => {
            console.warn('[cinescope] Failed to upsert watched item:', err)
            setSyncError(err instanceof Error ? err : new Error(String(err)))
            // Rollback to previous state on sync failure
            setWatchedList(prev)
          })
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
    syncError,
  }
}
