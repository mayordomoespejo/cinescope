/**
 * Canonical names for all Supabase Edge Functions used in cinescope.
 * Use these constants instead of raw string literals to avoid typos
 * and to make renaming functions a single-site change.
 */
export const SUPABASE_FUNCTIONS = {
  /** Syncs the user's favorite movies list */
  syncFavorites: 'sync-favorites',
  /** Syncs the user's watchlist */
  syncWatchlist: 'sync-watchlist',
  /** Syncs the user's watched history */
  syncWatched: 'sync-watched',
  /** Deletes all Supabase data for the user's account */
  deleteAccount: 'delete-account',
} as const

/**
 * Builds the full invocation URL for a Supabase Edge Function.
 * @param name - The Edge Function name (use a value from SUPABASE_FUNCTIONS).
 * @returns The absolute URL for the function endpoint.
 */
export function edgeFunctionUrl(name: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`
}
