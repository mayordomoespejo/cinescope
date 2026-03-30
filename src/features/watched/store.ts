import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

/** Media type discriminator */
export type MediaType = 'movie' | 'tv'

/** Unified media item stored in watched list */
export interface WatchedItem {
  media_id: number
  media_type: MediaType
  media_data: Movie | TVShow
  watched_at: string
}

// ── Edge Function sync ────────────────────────────────────────────────

/**
 * Upserts a single watched item via the sync-watched Edge Function.
 * @param token - Firebase ID token of the authenticated user.
 * @param item - The watched item to persist.
 */
export async function upsertToSupabase(token: string, item: WatchedItem): Promise<void> {
  await fetch(`${SUPABASE_URL}/functions/v1/sync-watched`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      media_id: item.media_id,
      media_type: item.media_type,
      media_data: item.media_data,
      watched_at: item.watched_at,
    }),
  })
}

/**
 * Removes a watched item via the sync-watched Edge Function.
 * @param token - Firebase ID token of the authenticated user.
 * @param mediaId - TMDB media ID.
 * @param mediaType - Media type ('movie' or 'tv').
 */
export async function deleteFromSupabase(
  token: string,
  mediaId: number,
  mediaType: MediaType
): Promise<void> {
  await fetch(
    `${SUPABASE_URL}/functions/v1/sync-watched?media_id=${mediaId}&media_type=${mediaType}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

/**
 * Loads watched items from Supabase via Edge Function and returns them as an array.
 * Should be called once after the user authenticates.
 * @param token - Firebase ID token of the authenticated user.
 */
export async function hydrateWatched(token: string): Promise<WatchedItem[]> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-watched`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return []

  const data = (await res.json()) as {
    items?: Array<{
      media_id: number
      media_type: MediaType
      media_data: Movie | TVShow
      watched_at: string
    }>
  }

  if (!data.items?.length) return []

  return data.items.map(row => ({
    media_id: row.media_id,
    media_type: row.media_type,
    media_data: row.media_data,
    watched_at: row.watched_at,
  }))
}
