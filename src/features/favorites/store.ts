import type { Movie } from '@/features/movies/types/movie'
import { edgeFunctionUrl, SUPABASE_FUNCTIONS } from '@/lib/supabaseFunctions'

// ── Search history (localStorage — UX convenience only) ────────────

const SEARCH_HISTORY_KEY = 'cinescope:search-history'
const MAX_HISTORY = 8

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded — data may not be persisted')
    }
  }
}

/**
 * Returns the recent search history from localStorage.
 */
export function getSearchHistory(): string[] {
  return readStorage<string[]>(SEARCH_HISTORY_KEY, [])
}

/**
 * Adds a search query to the history, deduplicating and capping at MAX_HISTORY entries.
 * @param query - The search string to record.
 */
export function addSearchQuery(query: string): void {
  const trimmed = query.trim()
  if (!trimmed) return
  const history = getSearchHistory().filter(q => q !== trimmed)
  writeStorage(SEARCH_HISTORY_KEY, [trimmed, ...history].slice(0, MAX_HISTORY))
}

/**
 * Clears all stored search history.
 */
export function clearSearchHistory(): void {
  writeStorage(SEARCH_HISTORY_KEY, [])
}

// ── Supabase sync via Edge Functions ────────────────────────────────

/**
 * Syncs the favorites list to Supabase via Edge Function.
 * @param token - Firebase ID token of the authenticated user.
 * @param movies - Current list of favorite movies to persist.
 */
export async function syncFavoritesToSupabase(token: string, movies: Movie[]): Promise<void> {
  const response = await fetch(edgeFunctionUrl(SUPABASE_FUNCTIONS.syncFavorites), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ movies }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Sync failed: ${response.status}`)
  }
}

/**
 * Syncs the watchlist to Supabase via Edge Function.
 * @param token - Firebase ID token of the authenticated user.
 * @param movies - Current watchlist movies to persist.
 */
export async function syncWatchlistToSupabase(token: string, movies: Movie[]): Promise<void> {
  const response = await fetch(edgeFunctionUrl(SUPABASE_FUNCTIONS.syncWatchlist), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ movies }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Sync failed: ${response.status}`)
  }
}

/**
 * Fetches favorites and watchlist from Supabase via Edge Functions.
 * Returns both arrays so the hook can set React state directly.
 * Should be called once after the user authenticates.
 * @param token - Firebase ID token of the authenticated user.
 * @param signal - Optional AbortSignal to cancel the request.
 */
export async function hydrateFromSupabase(
  token: string,
  signal?: AbortSignal
): Promise<{ favorites: Movie[]; watchlist: Movie[] }> {
  const [favRes, watchRes] = await Promise.all([
    fetch(edgeFunctionUrl(SUPABASE_FUNCTIONS.syncFavorites), {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    }),
    fetch(edgeFunctionUrl(SUPABASE_FUNCTIONS.syncWatchlist), {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    }),
  ])

  const [favData, watchData] = await Promise.all([
    favRes.ok ? (favRes.json() as Promise<unknown>) : Promise.resolve({ movies: [] }),
    watchRes.ok ? (watchRes.json() as Promise<unknown>) : Promise.resolve({ movies: [] }),
  ])

  if (!Array.isArray((favData as { movies?: unknown })?.movies)) {
    console.warn('[cinescope] Unexpected favorites response shape:', favData)
  }
  if (!Array.isArray((watchData as { movies?: unknown })?.movies)) {
    console.warn('[cinescope] Unexpected watchlist response shape:', watchData)
  }

  return {
    favorites: Array.isArray((favData as { movies?: Movie[] })?.movies)
      ? (favData as { movies: Movie[] }).movies
      : [],
    watchlist: Array.isArray((watchData as { movies?: Movie[] })?.movies)
      ? (watchData as { movies: Movie[] }).movies
      : [],
  }
}
