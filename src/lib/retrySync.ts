/**
 * Retries an async function with exponential backoff.
 * Attempt 1 → wait delayMs → Attempt 2 → wait delayMs*2 → Attempt 3 → throw
 *
 * @param fn - Async function to retry.
 * @param maxAttempts - Maximum number of attempts (default: 3).
 * @param delayMs - Initial delay in milliseconds before the second attempt (default: 500).
 */
export async function retrySync<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 500
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < maxAttempts) {
        await new Promise<void>(resolve =>
          setTimeout(resolve, delayMs * Math.pow(2, attempt - 1))
        )
      }
    }
  }

  throw lastError
}
