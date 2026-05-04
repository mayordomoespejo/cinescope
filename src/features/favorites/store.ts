import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import { tvShowToMovie } from '@/features/tv/adapters'

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
    } else {
      console.error('[cinescope] Unexpected storage error:', err)
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

// ── Favorites + Watchlist store (persisted to localStorage) ─────────

interface FavoritesState {
  favorites: Movie[]
  watchlist: Movie[]
  toggleFavorite: (item: Movie | TVShow) => void
  toggleWatchlist: (movie: Movie) => void
  reorderFavorites: (newOrder: Movie[]) => void
  reorderWatchlist: (newOrder: Movie[]) => void
  isFavorite: (id: number) => boolean
  isInWatchlist: (id: number) => boolean
}

/**
 * Zustand store for favorites and watchlist, persisted to localStorage
 * under the key `cinescope-favorites`.
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      watchlist: [],

      toggleFavorite: (item: Movie | TVShow) => {
        const movie = 'title' in item ? item : tvShowToMovie(item)
        set(state => {
          const exists = state.favorites.some(m => m.id === movie.id)
          return {
            favorites: exists
              ? state.favorites.filter(m => m.id !== movie.id)
              : [movie, ...state.favorites],
          }
        })
      },

      toggleWatchlist: (movie: Movie) => {
        set(state => {
          const exists = state.watchlist.some(m => m.id === movie.id)
          return {
            watchlist: exists
              ? state.watchlist.filter(m => m.id !== movie.id)
              : [movie, ...state.watchlist],
          }
        })
      },

      reorderFavorites: (newOrder: Movie[]) => {
        set({ favorites: newOrder })
      },

      reorderWatchlist: (newOrder: Movie[]) => {
        set({ watchlist: newOrder })
      },

      isFavorite: (id: number) => get().favorites.some(m => m.id === id),

      isInWatchlist: (id: number) => get().watchlist.some(m => m.id === id),
    }),
    {
      name: 'cinescope-favorites',
    }
  )
)
