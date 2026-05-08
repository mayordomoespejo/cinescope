import { useShallow } from 'zustand/react/shallow'
import { useFavoritesStore } from '../store'

/**
 * React hook for managing favorites and watchlist.
 * State is persisted to localStorage via Zustand `persist` middleware.
 * @returns Reactive state arrays and toggle/reorder action callbacks.
 */
export function useFavorites() {
  const {
    favorites,
    watchlist,
    toggleFavorite,
    toggleWatchlist,
    isFavorite,
    isInWatchlist,
    reorderFavorites,
    reorderWatchlist,
  } = useFavoritesStore(
    useShallow(s => ({
      favorites: s.favorites,
      watchlist: s.watchlist,
      toggleFavorite: s.toggleFavorite,
      toggleWatchlist: s.toggleWatchlist,
      isFavorite: s.isFavorite,
      isInWatchlist: s.isInWatchlist,
      reorderFavorites: s.reorderFavorites,
      reorderWatchlist: s.reorderWatchlist,
    }))
  )

  return {
    favorites,
    watchlist,
    toggleFavorite,
    toggleWatchlist,
    isFavorite,
    isInWatchlist,
    reorderFavorites,
    reorderWatchlist,
  }
}
