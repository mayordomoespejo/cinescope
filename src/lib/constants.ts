export const STORAGE_KEYS = {
  THEME: 'cinescope:theme',
  SEARCH_HISTORY: 'cinescope:search-history',
} as const

/** UI labels for media action buttons — single source of truth for accessibility text. */
export const ACTION_LABELS = {
  ADD_TO_FAVORITES: 'Add to favorites',
  REMOVE_FROM_FAVORITES: 'Remove from favorites',
  ADD_TO_WATCHLIST: 'Add to watchlist',
  REMOVE_FROM_WATCHLIST: 'Remove from watchlist',
  MARK_AS_WATCHED: 'Mark as watched',
  MARK_AS_UNWATCHED: 'Mark as unwatched',
} as const
