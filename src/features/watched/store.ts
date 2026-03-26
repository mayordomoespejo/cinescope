import { supabase } from '@/lib/supabaseClient'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'

/** Media type discriminator */
export type MediaType = 'movie' | 'tv'

/** Unified media item stored in watched list */
export interface WatchedItem {
  media_id: number
  media_type: MediaType
  media_data: Movie | TVShow
  watched_at: string
}

const WATCHED_KEY = 'cinescope:watched'

// ── Storage helpers ──────────────────────────────────────────────────

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full – ignore */
  }
}

function notifyChange(): void {
  window.dispatchEvent(new Event('cinescope:watched-change'))
}

// ── Supabase sync ────────────────────────────────────────────────────

/**
 * Upserts a single watched item to Supabase.
 * @param userId - Firebase UID of the authenticated user.
 * @param item - The watched item to persist.
 */
async function upsertToSupabase(userId: string, item: WatchedItem): Promise<void> {
  await supabase.from('cinescope_watched').upsert(
    {
      user_id: userId,
      media_id: item.media_id,
      media_type: item.media_type,
      media_data: item.media_data,
      watched_at: item.watched_at,
    },
    { onConflict: 'user_id,media_id,media_type' }
  )
}

/**
 * Removes a watched item from Supabase.
 * @param userId - Firebase UID of the authenticated user.
 * @param mediaId - TMDB media ID.
 * @param mediaType - Media type ('movie' or 'tv').
 */
async function deleteFromSupabase(
  userId: string,
  mediaId: number,
  mediaType: MediaType
): Promise<void> {
  await supabase
    .from('cinescope_watched')
    .delete()
    .eq('user_id', userId)
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Returns the current watched list from localStorage.
 */
export function getWatchedList(): WatchedItem[] {
  return readStorage<WatchedItem[]>(WATCHED_KEY, [])
}

/**
 * Adds or updates an item in the watched list (upsert by media_id + media_type).
 * Persists to Supabase if a userId is provided.
 * @param userId - Firebase UID of the authenticated user.
 * @param item - The media item to mark as watched (without watched_at; it is set here).
 */
export function addWatched(userId: string, item: Omit<WatchedItem, 'watched_at'>): void {
  const list = getWatchedList()
  const idx = list.findIndex(w => w.media_id === item.media_id && w.media_type === item.media_type)
  const entry: WatchedItem = { ...item, watched_at: new Date().toISOString() }
  const updated = idx >= 0 ? list.map((w, i) => (i === idx ? entry : w)) : [entry, ...list]
  writeStorage(WATCHED_KEY, updated)
  notifyChange()
  void upsertToSupabase(userId, entry)
}

/**
 * Removes an item from the watched list.
 * Persists the removal to Supabase if a userId is provided.
 * @param userId - Firebase UID of the authenticated user.
 * @param mediaId - TMDB media ID to remove.
 * @param mediaType - Media type ('movie' or 'tv').
 */
export function removeWatched(userId: string, mediaId: number, mediaType: MediaType): void {
  const updated = getWatchedList().filter(
    w => !(w.media_id === mediaId && w.media_type === mediaType)
  )
  writeStorage(WATCHED_KEY, updated)
  notifyChange()
  void deleteFromSupabase(userId, mediaId, mediaType)
}

/**
 * Returns true if the given media item is in the watched list.
 * Reads from localStorage (no network call).
 * @param mediaId - TMDB media ID.
 * @param mediaType - Media type ('movie' or 'tv').
 */
export function isWatched(mediaId: number, mediaType: MediaType): boolean {
  return getWatchedList().some(w => w.media_id === mediaId && w.media_type === mediaType)
}

/**
 * Loads watched items from Supabase and writes them to localStorage.
 * Should be called once after the user authenticates.
 * @param userId - Firebase UID of the authenticated user.
 */
export async function hydrateWatched(userId: string): Promise<void> {
  const { data } = await supabase
    .from('cinescope_watched')
    .select('media_id, media_type, media_data, watched_at')
    .eq('user_id', userId)
    .order('watched_at', { ascending: false })

  if (data) {
    const items: WatchedItem[] = data.map(row => ({
      media_id: row.media_id as number,
      media_type: row.media_type as MediaType,
      media_data: row.media_data as Movie | TVShow,
      watched_at: row.watched_at as string,
    }))
    writeStorage(WATCHED_KEY, items)
    notifyChange()
  }
}
