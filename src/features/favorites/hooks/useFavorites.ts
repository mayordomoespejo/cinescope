import { useFavoritesStore } from '../store'

/**
 * React hook for managing favorites and watchlist.
 * State is persisted to localStorage via Zustand `persist` middleware.
 * @returns Reactive state arrays and toggle/reorder action callbacks.
 */
export function useFavorites() {
  const favorites = useFavoritesStore(s => s.favorites)
  const watchlist = useFavoritesStore(s => s.watchlist)
  const toggleFavorite = useFavoritesStore(s => s.toggleFavorite)
  const toggleWatchlist = useFavoritesStore(s => s.toggleWatchlist)
  const isFavorite = useFavoritesStore(s => s.isFavorite)
  const isInWatchlist = useFavoritesStore(s => s.isInWatchlist)
  const reorderFavorites = useFavoritesStore(s => s.reorderFavorites)
  const reorderWatchlist = useFavoritesStore(s => s.reorderWatchlist)

  return {
    favorites,
    watchlist,
    isLoading: false,
    toggleFavorite,
    toggleWatchlist,
    isFavorite,
    isInWatchlist,
    reorderFavorites,
    reorderWatchlist,
  }
}
