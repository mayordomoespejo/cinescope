import { FAVORITES_PERSIST_KEY } from '@/features/favorites/store'
import { WATCHED_PERSIST_KEY } from '@/features/watched/store'
import { LISTS_PERSIST_KEY } from '@/features/lists/store'

export interface UseProfileActionsReturn {
  isClearing: boolean
  handleClearData: () => void
}

/**
 * useProfileActions — provides a handler to clear all cinescope localStorage keys.
 * Clears: cinescope-favorites, cinescope-watched, cinescope-lists.
 */
export function useProfileActions(): UseProfileActionsReturn {
  function handleClearData() {
    localStorage.removeItem(FAVORITES_PERSIST_KEY)
    localStorage.removeItem(WATCHED_PERSIST_KEY)
    localStorage.removeItem(LISTS_PERSIST_KEY)
    // Reload the page so Zustand stores reinitialise from the (now empty) localStorage
    window.location.reload()
  }

  return { isClearing: false, handleClearData }
}
