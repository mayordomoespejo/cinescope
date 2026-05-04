import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { retrySync } from '@/lib/retrySync'

/**
 * Returns a mock function that throws on the first N calls (synchronously
 * inside an async function) and resolves with `successValue` thereafter.
 * Throwing synchronously inside `async () => { throw err }` is equivalent to
 * returning a rejected promise but does NOT create a pre-rejected Promise
 * object that Vitest's unhandled-rejection detector can observe.
 */
function makeFn<T>(failTimes: number, error: Error, successValue: T) {
  let calls = 0
  return vi.fn(async () => {
    calls++
    if (calls <= failTimes) throw error
    return successValue
  })
}

/** Always-failing async mock (throws every call). */
function makeAlwaysFailing(error: Error) {
  return vi.fn(async () => {
    throw error
  })
}

describe('retrySync', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves on the first attempt when fn succeeds immediately', async () => {
    const fn = vi.fn(async () => 'ok')

    const result = await retrySync(fn)

    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries after a failure and eventually succeeds', async () => {
    const fn = makeFn(1, new Error('first fail'), 'success')

    const promise = retrySync(fn, 3, 500)

    // Advance past the first delay (500ms * 2^0 = 500ms)
    await vi.advanceTimersByTimeAsync(500)

    const result = await promise

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('throws after all maxAttempts are exhausted', async () => {
    const error = new Error('always fails')
    const fn = makeAlwaysFailing(error)

    // Attach a catch handler immediately so the promise is never "unhandled"
    let caught: unknown
    const promise = retrySync(fn, 3, 100).catch(err => {
      caught = err
    })

    // Advance past attempt 1 delay (100ms * 2^0) and attempt 2 delay (100ms * 2^1)
    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(200)
    await promise // resolves to undefined (catch returns void)

    expect(caught).toBe(error)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('uses exponential backoff between retries', async () => {
    const fn = makeFn(2, new Error('fail'), 'done')

    const promise = retrySync(fn, 3, 100)

    // After attempt 1 fails: delay = 100ms * 2^0 = 100ms
    await vi.advanceTimersByTimeAsync(99)
    // fn should not have been called again yet
    expect(fn).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1) // crosses the 100ms threshold — attempt 2 starts
    // After attempt 2 fails: delay = 100ms * 2^1 = 200ms
    await vi.advanceTimersByTimeAsync(200)

    const result = await promise
    expect(result).toBe('done')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('does not delay after the last failed attempt before throwing', async () => {
    const error = new Error('fail')
    const fn = makeAlwaysFailing(error)

    // Attach catch immediately to prevent unhandled rejection warning
    let caught: unknown
    const promise = retrySync(fn, 1).catch(err => {
      caught = err
    })

    // With maxAttempts=1 there is no retry delay — should reject without timer advance
    await promise

    expect(caught).toBe(error)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('preserves the last error thrown', async () => {
    const firstError = new Error('first error')
    const lastError = new Error('final error')
    let call = 0
    const fn = vi.fn(async () => {
      call++
      if (call === 1) throw firstError
      throw lastError
    })

    // maxAttempts=2 — one delay of 50ms * 2^0 = 50ms between attempts
    // Attach .catch immediately to prevent unhandled rejection warnings
    let caught: unknown
    const promise = retrySync(fn, 2, 50).catch(err => {
      caught = err
    })

    await vi.advanceTimersByTimeAsync(50)
    await promise

    expect(caught).toBe(lastError)
  })
})
