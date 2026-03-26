import { useCallback, useEffect, useRef } from 'react'
import { onAuthStateChanged } from '@/features/auth/authService'
import {
  getRating as getRatingStore,
  saveRating as saveRatingStore,
  deleteRating as deleteRatingStore,
  hydrateRatings,
} from './store'
import type { RatingEntry } from './store'
import type { MediaType } from '@/features/watched/store'

/**
 * React hook for managing user ratings.
 * Auto-hydrates from Supabase on auth state changes.
 *
 * @returns Rating action functions.
 */
export function useRatings() {
  const userIdRef = useRef<string | null>(null)

  // Hydrate from Supabase when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async user => {
      if (user && user.uid !== userIdRef.current) {
        userIdRef.current = user.uid
        await hydrateRatings(user.uid)
      } else if (!user) {
        userIdRef.current = null
      }
    })
    return unsubscribe
  }, [])

  /**
   * Returns the rating entry for a specific media item, or undefined if not rated.
   * @param mediaId - TMDB media ID.
   * @param mediaType - Media type ('movie' or 'tv').
   */
  const getRating = useCallback(
    (mediaId: number, mediaType: MediaType): RatingEntry | undefined => {
      return getRatingStore(mediaId, mediaType)
    },
    []
  )

  /**
   * Saves or updates a rating for a media item.
   * Requires the user to be authenticated.
   * @param mediaId - TMDB media ID.
   * @param mediaType - Media type ('movie' or 'tv').
   * @param rating - Integer value between 1 and 10.
   * @param note - Optional free-text note.
   */
  const saveRating = useCallback(
    (mediaId: number, mediaType: MediaType, rating: number, note?: string): void => {
      const userId = userIdRef.current
      if (!userId) return
      saveRatingStore(userId, mediaId, mediaType, rating, note)
    },
    []
  )

  /**
   * Deletes the rating for a media item.
   * Requires the user to be authenticated.
   * @param mediaId - TMDB media ID.
   * @param mediaType - Media type ('movie' or 'tv').
   */
  const deleteRating = useCallback((mediaId: number, mediaType: MediaType): void => {
    const userId = userIdRef.current
    if (!userId) return
    deleteRatingStore(userId, mediaId, mediaType)
  }, [])

  return {
    getRating,
    saveRating,
    deleteRating,
  }
}
