import type { Movie } from '@/features/movies/types/movie'
import { supabase } from '@/lib/supabaseClient'

const FAVORITES_KEY = 'cinescope:favorites'
const WATCHLIST_KEY = 'cinescope:watchlist'
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

function notifyChange() {
  window.dispatchEvent(new Event('cinescope:favorites-change'))
}

// ── Supabase sync ───────────────────────────────────────────────────

/**
 * Syncs the favorites list to Supabase using the provided Firebase user ID.
 * @param userId - Firebase UID of the authenticated user.
 * @param movies - Current list of favorite movies to persist.
 */
async function syncFavoritesToSupabase(userId: string, movies: Movie[]): Promise<void> {
  await supabase
    .from('cinescope_favorites')
    .upsert(
      { user_id: userId, movies, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
}

/**
 * Syncs the watchlist to Supabase using the provided Firebase user ID.
 * @param userId - Firebase UID of the authenticated user.
 * @param movies - Current watchlist movies to persist.
 */
async function syncWatchlistToSupabase(userId: string, movies: Movie[]): Promise<void> {
  await supabase
    .from('cinescope_watchlist')
    .upsert(
      { user_id: userId, movies, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
}

/**
 * Hydrates favorites and watchlist from Supabase into localStorage.
 * Should be called once after the user authenticates (e.g., in Navbar).
 * @param userId - Firebase UID of the authenticated user.
 */
export async function hydrateFromSupabase(userId: string): Promise<void> {
  const [favResult, watchResult] = await Promise.all([
    supabase.from('cinescope_favorites').select('movies').eq('user_id', userId).maybeSingle(),
    supabase.from('cinescope_watchlist').select('movies').eq('user_id', userId).maybeSingle(),
  ])

  if (favResult.data?.movies) {
    writeStorage(FAVORITES_KEY, favResult.data.movies)
  }
  if (watchResult.data?.movies) {
    writeStorage(WATCHLIST_KEY, watchResult.data.movies)
  }

  notifyChange()
}

// ── Favorites ──────────────────────────────────────────────────────

/**
 * Returns the current favorites list from localStorage cache.
 */
export function getFavorites(): Movie[] {
  return readStorage<Movie[]>(FAVORITES_KEY, [])
}

/**
 * Adds a movie to favorites. No-op if already present.
 * Persists to Supabase if a userId is provided.
 * @param movie - Movie to add.
 * @param userId - Firebase UID of the authenticated user (optional).
 */
export function addFavorite(movie: Movie, userId?: string): void {
  const list = getFavorites()
  if (!list.find(m => m.id === movie.id)) {
    const updated = [movie, ...list]
    writeStorage(FAVORITES_KEY, updated)
    notifyChange()
    if (userId) void syncFavoritesToSupabase(userId, updated)
  }
}

/**
 * Removes a movie from favorites by ID.
 * Persists the updated list to Supabase if a userId is provided.
 * @param id - TMDB movie ID to remove.
 * @param userId - Firebase UID of the authenticated user (optional).
 */
export function removeFavorite(id: number, userId?: string): void {
  const updated = getFavorites().filter(m => m.id !== id)
  writeStorage(FAVORITES_KEY, updated)
  notifyChange()
  if (userId) void syncFavoritesToSupabase(userId, updated)
}

/**
 * Returns true if the movie is in the favorites list.
 * @param id - TMDB movie ID.
 */
export function isFavorite(id: number): boolean {
  return getFavorites().some(m => m.id === id)
}

/**
 * Replaces the favorites list with a new ordered array.
 * Persists to Supabase if a userId is provided.
 * @param newOrder - Reordered favorites list.
 * @param userId - Firebase UID of the authenticated user (optional).
 */
export function reorderFavorites(newOrder: Movie[], userId?: string): void {
  writeStorage(FAVORITES_KEY, newOrder)
  notifyChange()
  if (userId) void syncFavoritesToSupabase(userId, newOrder)
}

// ── Watchlist ──────────────────────────────────────────────────────

/**
 * Returns the current watchlist from localStorage cache.
 */
export function getWatchlist(): Movie[] {
  return readStorage<Movie[]>(WATCHLIST_KEY, [])
}

/**
 * Adds a movie to the watchlist. No-op if already present.
 * Persists to Supabase if a userId is provided.
 * @param movie - Movie to add.
 * @param userId - Firebase UID of the authenticated user (optional).
 */
export function addToWatchlist(movie: Movie, userId?: string): void {
  const list = getWatchlist()
  if (!list.find(m => m.id === movie.id)) {
    const updated = [movie, ...list]
    writeStorage(WATCHLIST_KEY, updated)
    notifyChange()
    if (userId) void syncWatchlistToSupabase(userId, updated)
  }
}

/**
 * Removes a movie from the watchlist by ID.
 * Persists the updated list to Supabase if a userId is provided.
 * @param id - TMDB movie ID to remove.
 * @param userId - Firebase UID of the authenticated user (optional).
 */
export function removeFromWatchlist(id: number, userId?: string): void {
  const updated = getWatchlist().filter(m => m.id !== id)
  writeStorage(WATCHLIST_KEY, updated)
  notifyChange()
  if (userId) void syncWatchlistToSupabase(userId, updated)
}

/**
 * Returns true if the movie is in the watchlist.
 * @param id - TMDB movie ID.
 */
export function isInWatchlist(id: number): boolean {
  return getWatchlist().some(m => m.id === id)
}

/**
 * Replaces the watchlist with a new ordered array.
 * Persists to Supabase if a userId is provided.
 * @param newOrder - Reordered watchlist.
 * @param userId - Firebase UID of the authenticated user (optional).
 */
export function reorderWatchlist(newOrder: Movie[], userId?: string): void {
  writeStorage(WATCHLIST_KEY, newOrder)
  notifyChange()
  if (userId) void syncWatchlistToSupabase(userId, newOrder)
}

// ── Watched ────────────────────────────────────────────────────────

const WATCHED_KEY = 'cinescope:watched'

/**
 * Returns the set of watched movie IDs from localStorage.
 */
export function getWatched(): number[] {
  return readStorage<number[]>(WATCHED_KEY, [])
}

/**
 * Marks a movie as watched by its TMDB ID.
 * No-op if already marked.
 * @param id - TMDB movie ID.
 */
export function markWatched(id: number): void {
  const list = getWatched()
  if (!list.includes(id)) {
    writeStorage(WATCHED_KEY, [id, ...list])
    notifyChange()
  }
}

/**
 * Unmarks a movie as watched by its TMDB ID.
 * @param id - TMDB movie ID.
 */
export function unmarkWatched(id: number): void {
  writeStorage(
    WATCHED_KEY,
    getWatched().filter(w => w !== id)
  )
  notifyChange()
}

/**
 * Returns true if the movie has been marked as watched.
 * @param id - TMDB movie ID.
 */
export function isWatched(id: number): boolean {
  return getWatched().includes(id)
}

// ── Search history ─────────────────────────────────────────────────

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
