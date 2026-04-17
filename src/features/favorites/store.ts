import type { Movie } from '@/features/movies/types/movie'
import { edgeFunctionUrl, SUPABASE_FUNCTIONS } from '@/lib/supabaseFunctions'

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
 */
export async function hydrateFromSupabase(
  token: string
): Promise<{ favorites: Movie[]; watchlist: Movie[] }> {
  const [favRes, watchRes] = await Promise.all([
    fetch(edgeFunctionUrl(SUPABASE_FUNCTIONS.syncFavorites), {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(edgeFunctionUrl(SUPABASE_FUNCTIONS.syncWatchlist), {
      headers: { Authorization: `Bearer ${token}` },
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
