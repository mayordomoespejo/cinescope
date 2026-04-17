import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import { edgeFunctionUrl, SUPABASE_FUNCTIONS } from '@/lib/supabaseFunctions'
import type { MediaType } from '@/lib/types'

export type { MediaType }

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
  const response = await fetch(edgeFunctionUrl(SUPABASE_FUNCTIONS.syncWatched), {
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
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Sync failed: ${response.status}`)
  }
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
  const response = await fetch(
    `${edgeFunctionUrl(SUPABASE_FUNCTIONS.syncWatched)}?media_id=${mediaId}&media_type=${mediaType}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Sync failed: ${response.status}`)
  }
}

/**
 * Loads watched items from Supabase via Edge Function and returns them as an array.
 * Should be called once after the user authenticates.
 * @param token - Firebase ID token of the authenticated user.
 * @param signal - Optional AbortSignal to cancel the request.
 */
export async function hydrateWatched(token: string, signal?: AbortSignal): Promise<WatchedItem[]> {
  const res = await fetch(edgeFunctionUrl(SUPABASE_FUNCTIONS.syncWatched), {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })

  if (!res.ok) return []

  const data = (await res.json()) as unknown

  if (!Array.isArray((data as { items?: unknown })?.items)) {
    console.warn('[cinescope] Unexpected watched response shape:', data)
    return []
  }

  const typed = data as {
    items: Array<{
      media_id: number
      media_type: MediaType
      media_data: Movie | TVShow
      watched_at: string
    }>
  }

  if (!typed.items.length) return []

  return typed.items.map(row => ({
    media_id: row.media_id,
    media_type: row.media_type,
    media_data: row.media_data,
    watched_at: row.watched_at,
  }))
}
