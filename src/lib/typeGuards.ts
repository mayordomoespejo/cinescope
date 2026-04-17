import type { FavoriteItem } from '@/lib/types'
import type { CinescopeList, ListItem } from '@/features/lists/store'
import type { WatchedItem } from '@/features/watched/store'

// ── Generic helpers ──────────────────────────────────────────────────

/**
 * Returns true when `val` is a non-null object.
 * Useful as a base check before accessing properties on unknown values.
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null
}

// ── Firebase / Auth guards ───────────────────────────────────────────

/** Shape of a Firebase error that carries a string `code` property. */
interface FirebaseError extends Error {
  code: string
}

/**
 * Narrows an unknown caught value to a Firebase-style error with a `code` field.
 */
export function isFirebaseError(err: unknown): err is FirebaseError {
  return err instanceof Error && 'code' in err && typeof (err as Record<string, unknown>).code === 'string'
}

// ── Lists store guards ───────────────────────────────────────────────

/**
 * Narrows an unknown Supabase row to {@link CinescopeList}.
 * Checks the minimum fields required by the interface.
 */
export function isCinescopeList(row: unknown): row is CinescopeList {
  if (!isObject(row)) return false
  return (
    typeof row.id === 'string' &&
    typeof row.user_id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.created_at === 'string'
  )
}

/**
 * Narrows an unknown Supabase row to {@link ListItem}.
 * Checks the minimum fields required by the interface.
 */
export function isListItem(row: unknown): row is ListItem {
  if (!isObject(row)) return false
  return (
    typeof row.list_id === 'string' &&
    typeof row.media_id === 'number' &&
    typeof row.media_type === 'string' &&
    typeof row.added_at === 'string'
  )
}

// ── Watched store guards ─────────────────────────────────────────────

/**
 * Narrows an unknown value to a {@link WatchedItem} array.
 * Checks that the value is an array and, if non-empty, that the first element
 * carries the `media_id` and `media_type` fields that every WatchedItem must have.
 */
export function isWatchedItemArray(val: unknown): val is WatchedItem[] {
  if (!Array.isArray(val)) return false
  if (val.length === 0) return true
  const first = val[0] as Record<string, unknown>
  return typeof first?.media_id === 'number' && typeof first?.media_type === 'string'
}

/**
 * Narrows an unknown value to an object that may carry an `items` array.
 * Used to safely extract the items array from the sync-watched Edge Function response.
 */
export function isWatchedResponse(data: unknown): data is { items: unknown[] } {
  return isObject(data) && Array.isArray((data as { items?: unknown }).items)
}

// ── Favorites store guards ───────────────────────────────────────────

/**
 * Narrows an unknown value to an object that may carry a `movies` array.
 * Used to safely extract arrays from Supabase Edge Function responses.
 */
export function isMoviesResponse(data: unknown): data is { movies?: FavoriteItem[] } {
  return isObject(data) && (!('movies' in data) || Array.isArray((data as { movies?: unknown }).movies))
}
