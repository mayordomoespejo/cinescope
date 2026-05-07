/**
 * Tests for genre-related TanStack Query hooks: useGenres, useTVGenres
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'

vi.mock('@/features/movies/api/tmdbApi', () => ({
  fetchGenres: vi.fn(),
}))

vi.mock('@/features/tv/api/tvApi', () => ({
  fetchTVGenres: vi.fn(),
}))

import { fetchGenres } from '@/features/movies/api/tmdbApi'
import { fetchTVGenres } from '@/features/tv/api/tvApi'
import { useGenres } from '@/features/filters/hooks/useGenres'
import { useTVGenres } from '@/features/tv/hooks/useTVGenres'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  })
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { wrapper }
}

const mockGenres = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
]

beforeEach(() => {
  vi.mocked(fetchGenres).mockResolvedValue({ genres: mockGenres })
  vi.mocked(fetchTVGenres).mockResolvedValue({ genres: mockGenres })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useGenres', () => {
  it('fetches movie genres', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useGenres(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchGenres).toHaveBeenCalled()
  })

  it('returns genres array via select', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useGenres(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockGenres)
  })
})

describe('useTVGenres', () => {
  it('fetches TV genres', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVGenres(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(fetchTVGenres).toHaveBeenCalled()
  })

  it('returns genres array via select', async () => {
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useTVGenres(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockGenres)
  })
})
