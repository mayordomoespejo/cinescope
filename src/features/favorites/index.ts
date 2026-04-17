// Hooks
export { useFavorites } from './hooks/useFavorites'

// Store — search history + Supabase sync
export {
  getSearchHistory,
  addSearchQuery,
  clearSearchHistory,
  syncFavoritesToSupabase,
  syncWatchlistToSupabase,
  hydrateFromSupabase,
} from './store'
