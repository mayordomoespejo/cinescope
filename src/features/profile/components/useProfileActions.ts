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
    localStorage.removeItem('cinescope-favorites')
    localStorage.removeItem('cinescope-watched')
    localStorage.removeItem('cinescope-lists')
    // Reload the page so Zustand stores reinitialise from the (now empty) localStorage
    window.location.reload()
  }

  return { isClearing: false, handleClearData }
}
