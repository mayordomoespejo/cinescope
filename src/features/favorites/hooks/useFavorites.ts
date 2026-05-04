import { useState, useCallback, useEffect, useRef } from 'react'
import type { Movie } from '@/features/movies/types/movie'
import { hydrateFromSupabase, syncFavoritesToSupabase, syncWatchlistToSupabase } from '../store'
import { useAuth } from '@/features/auth/useAuth'

/**
 * @description React hook for managing favorites and watchlist as in-memory React state.
 * Hydrates from Supabase on login and syncs mutations back to Supabase (fire-and-forget).
 * Exposes `syncError` when a Supabase sync fails so callers can surface it to users.
 * @returns Reactive state arrays and toggle/reorder action callbacks.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Movie[]>([])
  const [watchlist, setWatchlist] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [syncError, setSyncError] = useState<Error | null>(null)
  const { user } = useAuth()
  const prevUserIdRef = useRef<string | null>(null)

  const getToken = useCallback(async (): Promise<string | undefined> => {
    if (!user) return undefined
    try {
      return await user.getIdToken(false)
    } catch {
      return undefined
    }
  }, [user])

  // Hydrate from Supabase when a new user logs in; clear state on logout
  useEffect(() => {
    if (user && user.uid !== prevUserIdRef.current) {
      prevUserIdRef.current = user.uid
      const controller = new AbortController()
      ;(async () => {
        setIsLoading(true)
        const token = await user.getIdToken(false)
        if (controller.signal.aborted) return
        const { favorites: favs, watchlist: watch } = await hydrateFromSupabase(
          token,
          controller.signal
        )
        if (controller.signal.aborted) return
        setFavorites(favs)
        setWatchlist(watch)
        setIsLoading(false)
      })().catch(err => {
        if ((err as Error).name !== 'AbortError') {
          console.warn('[cinescope] Failed to hydrate from Supabase:', err)
          setSyncError(err instanceof Error ? err : new Error(String(err)))
          setIsLoading(false)
        }
      })
      return () => controller.abort()
    } else if (!user) {
      prevUserIdRef.current = null
      const t = setTimeout(() => {
        setFavorites([])
        setWatchlist([])
        setIsLoading(false)
        setSyncError(null)
      }, 0)
      return () => clearTimeout(t)
    }
  }, [user])

  const toggleFavorite = useCallback(
    async (movie: Movie) => {
      const token = await getToken()
      setSyncError(null)
      // Capture previous state for rollback on sync failure
      setFavorites(prev => {
        const exists = prev.some(m => m.id === movie.id)
        const updated = exists ? prev.filter(m => m.id !== movie.id) : [movie, ...prev]
        if (token) {
          syncFavoritesToSupabase(token, updated).catch(err => {
            console.warn('[cinescope] Failed to sync favorites:', err)
            setSyncError(err instanceof Error ? err : new Error(String(err)))
            // Rollback to previous state on sync failure
            setFavorites(prev)
          })
        }
        return updated
      })
    },
    [getToken]
  )

  const toggleWatchlist = useCallback(
    async (movie: Movie) => {
      const token = await getToken()
      setSyncError(null)
      setWatchlist(prev => {
        const exists = prev.some(m => m.id === movie.id)
        const updated = exists ? prev.filter(m => m.id !== movie.id) : [movie, ...prev]
        if (token) {
          syncWatchlistToSupabase(token, updated).catch(err => {
            console.warn('[cinescope] Failed to sync watchlist:', err)
            setSyncError(err instanceof Error ? err : new Error(String(err)))
            // Rollback to previous state on sync failure
            setWatchlist(prev)
          })
        }
        return updated
      })
    },
    [getToken]
  )

  const isFavorite = useCallback((id: number) => favorites.some(m => m.id === id), [favorites])

  const isInWatchlist = useCallback((id: number) => watchlist.some(m => m.id === id), [watchlist])

  const reorderFavs = useCallback(
    async (newOrder: Movie[]) => {
      setFavorites(newOrder)
      const token = await getToken()
      if (token)
        syncFavoritesToSupabase(token, newOrder).catch(err => {
          console.warn('[cinescope] Failed to sync favorites:', err)
          setSyncError(err instanceof Error ? err : new Error(String(err)))
        })
    },
    [getToken]
  )

  const reorderWatch = useCallback(
    async (newOrder: Movie[]) => {
      setWatchlist(newOrder)
      const token = await getToken()
      if (token)
        syncWatchlistToSupabase(token, newOrder).catch(err => {
          console.warn('[cinescope] Failed to sync watchlist:', err)
          setSyncError(err instanceof Error ? err : new Error(String(err)))
        })
    },
    [getToken]
  )

  return {
    favorites,
    watchlist,
    isLoading,
    syncError,
    toggleFavorite,
    toggleWatchlist,
    isFavorite,
    isInWatchlist,
    reorderFavorites: reorderFavs,
    reorderWatchlist: reorderWatch,
  }
}
