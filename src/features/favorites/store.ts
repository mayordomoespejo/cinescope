import type { Movie } from '@/features/movies/types/movie'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

// ── Search history (localStorage — UX convenience only) ────────────

const SEARCH_HISTORY_KEY = 'cinescope:search-history'
const MAX_HISTORY = 8

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
  await fetch(`${SUPABASE_URL}/functions/v1/sync-favorites`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ movies }),
  })
}

/**
 * Syncs the watchlist to Supabase via Edge Function.
 * @param token - Firebase ID token of the authenticated user.
 * @param movies - Current watchlist movies to persist.
 */
export async function syncWatchlistToSupabase(token: string, movies: Movie[]): Promise<void> {
  await fetch(`${SUPABASE_URL}/functions/v1/sync-watchlist`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ movies }),
  })
}

/**
 * Fetches favorites and watchlist from Supabase via Edge Functions.
 * Returns both arrays so the hook can set React state directly.
 * Should be called once after the user authenticates.
 * @param token - Firebase ID token of the authenticated user.
 */
export async function hydrateFromSupabase(
  token: string
): Promise<{ favorites: Movie[]; watchlist: Movie[] }> {
  const [favRes, watchRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/functions/v1/sync-favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${SUPABASE_URL}/functions/v1/sync-watchlist`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])

  const [favData, watchData] = await Promise.all([
    favRes.ok ? (favRes.json() as Promise<{ movies: Movie[] }>) : Promise.resolve({ movies: [] }),
    watchRes.ok
      ? (watchRes.json() as Promise<{ movies: Movie[] }>)
      : Promise.resolve({ movies: [] }),
  ])

  return {
    favorites: favData.movies ?? [],
    watchlist: watchData.movies ?? [],
  }
}
