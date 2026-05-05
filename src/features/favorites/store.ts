import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import { tvShowToMovie } from '@/features/tv/adapters'

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
