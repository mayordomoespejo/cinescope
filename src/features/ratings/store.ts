import { supabase } from '@/lib/supabaseClient'
import type { MediaType } from '@/features/watched/store'

/** A user rating entry */
export interface RatingEntry {
  media_id: number
  media_type: MediaType
  /** Integer 1–10 */
  rating: number
  /** Optional free-text note */
  note?: string
  created_at: string
}

const RATINGS_KEY = 'cinescope:ratings'

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
  window.dispatchEvent(new Event('cinescope:ratings-change'))
}

// ── Supabase sync ────────────────────────────────────────────────────

/**
 * Upserts a rating to Supabase.
 * @param userId - Firebase UID of the authenticated user.
 * @param entry - Rating entry to persist.
 */
async function upsertToSupabase(userId: string, entry: RatingEntry): Promise<void> {
  await supabase.from('cinescope_ratings').upsert(
    {
      user_id: userId,
      media_id: entry.media_id,
      media_type: entry.media_type,
      rating: entry.rating,
      note: entry.note ?? null,
      created_at: entry.created_at,
    },
    { onConflict: 'user_id,media_id,media_type' }
  )
}

/**
 * Deletes a rating from Supabase.
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
    .from('cinescope_ratings')
    .delete()
    .eq('user_id', userId)
    .eq('media_id', mediaId)
    .eq('media_type', mediaType)
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Returns all ratings from localStorage.
 */
export function getAllRatings(): RatingEntry[] {
  return readStorage<RatingEntry[]>(RATINGS_KEY, [])
}

/**
 * Returns the rating for a specific media item, or undefined if not rated.
 * Reads from localStorage (no network call).
 * @param mediaId - TMDB media ID.
 * @param mediaType - Media type ('movie' or 'tv').
 */
export function getRating(mediaId: number, mediaType: MediaType): RatingEntry | undefined {
  return getAllRatings().find(r => r.media_id === mediaId && r.media_type === mediaType)
}

/**
 * Saves (upserts) a rating for a media item.
 * Persists to Supabase using the provided userId.
 * @param userId - Firebase UID of the authenticated user.
 * @param mediaId - TMDB media ID.
 * @param mediaType - Media type ('movie' or 'tv').
 * @param rating - Integer rating value between 1 and 10.
 * @param note - Optional free-text note.
 */
export function saveRating(
  userId: string,
  mediaId: number,
  mediaType: MediaType,
  rating: number,
  note?: string
): void {
  const list = getAllRatings()
  const entry: RatingEntry = {
    media_id: mediaId,
    media_type: mediaType,
    rating,
    note,
    created_at: new Date().toISOString(),
  }
  const idx = list.findIndex(r => r.media_id === mediaId && r.media_type === mediaType)
  const updated = idx >= 0 ? list.map((r, i) => (i === idx ? entry : r)) : [entry, ...list]
  writeStorage(RATINGS_KEY, updated)
  notifyChange()
  void upsertToSupabase(userId, entry)
}

/**
 * Deletes the rating for a media item.
 * Persists the removal to Supabase using the provided userId.
 * @param userId - Firebase UID of the authenticated user.
 * @param mediaId - TMDB media ID.
 * @param mediaType - Media type ('movie' or 'tv').
 */
export function deleteRating(userId: string, mediaId: number, mediaType: MediaType): void {
  const updated = getAllRatings().filter(
    r => !(r.media_id === mediaId && r.media_type === mediaType)
  )
  writeStorage(RATINGS_KEY, updated)
  notifyChange()
  void deleteFromSupabase(userId, mediaId, mediaType)
}

/**
 * Loads ratings from Supabase and writes them to localStorage.
 * Should be called once after the user authenticates.
 * @param userId - Firebase UID of the authenticated user.
 */
export async function hydrateRatings(userId: string): Promise<void> {
  const { data } = await supabase
    .from('cinescope_ratings')
    .select('media_id, media_type, rating, note, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (data) {
    const entries: RatingEntry[] = data.map(row => ({
      media_id: row.media_id as number,
      media_type: row.media_type as MediaType,
      rating: row.rating as number,
      note: row.note as string | undefined,
      created_at: row.created_at as string,
    }))
    writeStorage(RATINGS_KEY, entries)
    notifyChange()
  }
}
