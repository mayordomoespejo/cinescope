import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { createMediaHook } from '@/lib/mediaQueryFactory'

// ── Helpers ───────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper, queryClient }
}

// ── Tests ─────────────────────────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks()
})

describe('createMediaHook — factory', () => {
  describe('basic fetching', () => {
    it('calls queryFn and returns data when enabled', async () => {
      const mockFn = vi.fn().mockResolvedValue({ result: 'ok' })
      const useHook = createMediaHook({
        queryKeyFn: (p: { id: number }) => ['test', p.id],
        queryFn: mockFn,
        staleTime: 0,
      })

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useHook({ id: 1 }), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ result: 'ok' })
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith({ id: 1 })
    })

    it('returns loading state while queryFn is pending', () => {
      const mockFn = vi.fn().mockReturnValue(new Promise(() => {}))
      const useHook = createMediaHook({
        queryKeyFn: (p: { id: number }) => ['test-loading', p.id],
        queryFn: mockFn,
        staleTime: 0,
      })

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useHook({ id: 2 }), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()
    })

    it('returns error state when queryFn rejects', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('fetch failed'))
      const useHook = createMediaHook({
        queryKeyFn: (p: { id: number }) => ['test-error', p.id],
        queryFn: mockFn,
        staleTime: 0,
      })

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useHook({ id: 3 }), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeInstanceOf(Error)
      expect((result.current.error as Error).message).toBe('fetch failed')
    })
  })

  describe('enabledFn', () => {
    it('does NOT call queryFn when enabledFn returns false', async () => {
      const mockFn = vi.fn().mockResolvedValue('should not be called')
      const useHook = createMediaHook({
        queryKeyFn: (p: { id: number | null }) => ['test-disabled', p.id],
        queryFn: mockFn,
        staleTime: 0,
        enabledFn: ({ id }) => id !== null && id > 0,
      })

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useHook({ id: null }), { wrapper })

      // Give the event loop a chance to fire if a fetch were to happen
      await new Promise(r => setTimeout(r, 50))

      expect(mockFn).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
      // Disabled query should not be in a loading state
      expect(result.current.isLoading).toBe(false)
    })

    it('calls queryFn when enabledFn returns true', async () => {
      const mockFn = vi.fn().mockResolvedValue({ ok: true })
      const useHook = createMediaHook({
        queryKeyFn: (p: { id: number | null }) => ['test-enabled', p.id],
        queryFn: mockFn,
        staleTime: 0,
        enabledFn: ({ id }) => id !== null && id > 0,
      })

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useHook({ id: 5 }), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(result.current.data).toEqual({ ok: true })
    })
  })

  describe('queryKey caching', () => {
    it('uses separate cache entries for different params', async () => {
      const mockFn = vi.fn()
        .mockResolvedValueOnce({ page: 1 })
        .mockResolvedValueOnce({ page: 2 })

      const useHook = createMediaHook({
        queryKeyFn: (p: { page: number }) => ['cache-test', p.page],
        queryFn: mockFn,
        staleTime: Infinity,
      })

      const { wrapper } = createWrapper()

      const { result: result1 } = renderHook(() => useHook({ page: 1 }), { wrapper })
      await waitFor(() => expect(result1.current.isSuccess).toBe(true))
      expect(result1.current.data).toEqual({ page: 1 })

      const { result: result2 } = renderHook(() => useHook({ page: 2 }), { wrapper })
      await waitFor(() => expect(result2.current.isSuccess).toBe(true))
      expect(result2.current.data).toEqual({ page: 2 })

      // Each unique page param produced its own fetch
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('serves cached data for the same queryKey without re-fetching', async () => {
      const mockFn = vi.fn().mockResolvedValue({ cached: true })
      const useHook = createMediaHook({
        queryKeyFn: (_p: { id: number }) => ['shared-key'],
        queryFn: mockFn,
        staleTime: Infinity,
      })

      const { wrapper } = createWrapper()

      const { result: r1 } = renderHook(() => useHook({ id: 1 }), { wrapper })
      await waitFor(() => expect(r1.current.isSuccess).toBe(true))

      const { result: r2 } = renderHook(() => useHook({ id: 1 }), { wrapper })
      await waitFor(() => expect(r2.current.isSuccess).toBe(true))

      // Same key → only one network request
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(r2.current.data).toEqual({ cached: true })
    })
  })

  describe('staleTime', () => {
    it('passes staleTime to the underlying useQuery', async () => {
      const mockFn = vi.fn().mockResolvedValue('data')
      const useHook = createMediaHook({
        queryKeyFn: (_p: Record<string, never>) => ['stale-test'],
        queryFn: mockFn,
        staleTime: 1000 * 60 * 5,
      })

      const { wrapper } = createWrapper()
      const { result } = renderHook(() => useHook({}), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      // Query resolved — isStale should be false because staleTime has not elapsed
      expect(result.current.isStale).toBe(false)
    })
  })
})
