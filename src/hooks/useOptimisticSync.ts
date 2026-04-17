import { retrySync } from '@/lib/retrySync'

/**
 * Returns an `execSync` helper that wraps an async operation in `retrySync`,
 * clears the sync error on success, and rolls back optimistic state + sets a
 * user-facing error message on failure.
 *
 * @param setSyncError - State setter for the caller's `syncError` field.
 */
export function useOptimisticSync(setSyncError: (msg: string | null) => void) {
  return function execSync<T>(
    fn: () => Promise<T>,
    rollback: () => void,
    label: string
  ): void {
    retrySync(fn)
      .then(() => setSyncError(null))
      .catch(err => {
        console.error(`[cinescope] ${label}`, err)
        rollback()
        setSyncError('Failed to save changes. Tap to retry.')
      })
  }
}
