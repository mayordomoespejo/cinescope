import type { Movie } from '@/features/movies/types/movie'

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

// ── Favorites ──────────────────────────────────────────────────────

export function getFavorites(): Movie[] {
  return readStorage<Movie[]>(FAVORITES_KEY, [])
}

export function addFavorite(movie: Movie): void {
  const list = getFavorites()
  if (!list.find(m => m.id === movie.id)) {
    writeStorage(FAVORITES_KEY, [movie, ...list])
    notifyChange()
  }
}

export function removeFavorite(id: number): void {
  writeStorage(
    FAVORITES_KEY,
    getFavorites().filter(m => m.id !== id)
  )
  notifyChange()
}

export function isFavorite(id: number): boolean {
  return getFavorites().some(m => m.id === id)
}

export function reorderFavorites(newOrder: Movie[]): void {
  writeStorage(FAVORITES_KEY, newOrder)
  notifyChange()
}

// ── Watchlist ──────────────────────────────────────────────────────

export function getWatchlist(): Movie[] {
  return readStorage<Movie[]>(WATCHLIST_KEY, [])
}

export function addToWatchlist(movie: Movie): void {
  const list = getWatchlist()
  if (!list.find(m => m.id === movie.id)) {
    writeStorage(WATCHLIST_KEY, [movie, ...list])
    notifyChange()
  }
}

export function removeFromWatchlist(id: number): void {
  writeStorage(
    WATCHLIST_KEY,
    getWatchlist().filter(m => m.id !== id)
  )
  notifyChange()
}

export function isInWatchlist(id: number): boolean {
  return getWatchlist().some(m => m.id === id)
}

export function reorderWatchlist(newOrder: Movie[]): void {
  writeStorage(WATCHLIST_KEY, newOrder)
  notifyChange()
}

// ── Search history ─────────────────────────────────────────────────

export function getSearchHistory(): string[] {
  return readStorage<string[]>(SEARCH_HISTORY_KEY, [])
}

export function addSearchQuery(query: string): void {
  const trimmed = query.trim()
  if (!trimmed) return
  const history = getSearchHistory().filter(q => q !== trimmed)
  writeStorage(SEARCH_HISTORY_KEY, [trimmed, ...history].slice(0, MAX_HISTORY))
}

export function clearSearchHistory(): void {
  writeStorage(SEARCH_HISTORY_KEY, [])
}
