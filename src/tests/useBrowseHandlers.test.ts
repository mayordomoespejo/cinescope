import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBrowseHandlers } from '@/hooks/browse/useBrowseHandlers'
import { useFavoritesStore } from '@/features/favorites/store'

// ── Mocks ─────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
const mockOnOpenMovie = vi.fn()
const mockPrefetchMovieData = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/components/ui/LayoutContext', () => ({
  useOutletContext: vi.fn(),
}))

vi.mock('@/features/movies/hooks/useMoviePrefetch', () => ({
  useMoviePrefetch: () => ({ prefetchMovieData: mockPrefetchMovieData }),
}))

import { useOutletContext } from '@/components/ui/LayoutContext'
const mockUseOutletContext = vi.mocked(useOutletContext)

beforeEach(() => {
  mockNavigate.mockReset()
  mockOnOpenMovie.mockReset()
  mockPrefetchMovieData.mockReset()
  mockUseOutletContext.mockReturnValue({ onOpenMovie: mockOnOpenMovie })
  useFavoritesStore.setState({ favorites: [], watchlist: [] })
  localStorage.clear()
})

describe('useBrowseHandlers', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useBrowseHandlers())
    expect(typeof result.current.onOpenMovie).toBe('function')
    expect(typeof result.current.onOpenShow).toBe('function')
    expect(typeof result.current.onPrefetch).toBe('function')
    expect(typeof result.current.onToggleFavorite).toBe('function')
    expect(Array.isArray(result.current.favoriteIds)).toBe(true)
  })

  it('onOpenMovie calls context onOpenMovie', () => {
    const { result } = renderHook(() => useBrowseHandlers())
    act(() => result.current.onOpenMovie(42))
    expect(mockOnOpenMovie).toHaveBeenCalledWith(42)
  })

  it('onOpenShow navigates to tv detail page', () => {
    const { result } = renderHook(() => useBrowseHandlers())
    act(() => result.current.onOpenShow(99))
    expect(mockNavigate).toHaveBeenCalledWith('/tv/99')
  })

  it('onPrefetch is prefetchMovieData', () => {
    const { result } = renderHook(() => useBrowseHandlers())
    result.current.onPrefetch(7)
    expect(mockPrefetchMovieData).toHaveBeenCalledWith(7)
  })

  it('onToggleFavorite adds movie to favorites', () => {
    const { result } = renderHook(() => useBrowseHandlers())
    const movie = {
      id: 1,
      title: 'Test',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      release_date: '2024-01-01',
      vote_average: 7,
      vote_count: 100,
      genre_ids: [],
      popularity: 50,
      adult: false,
      original_language: 'en',
      original_title: 'Test',
    }
    act(() => result.current.onToggleFavorite(movie))
    expect(useFavoritesStore.getState().favorites).toHaveLength(1)
  })

  it('favoriteIds reflects current favorites', () => {
    useFavoritesStore.setState({
      favorites: [
        {
          id: 10,
          title: 'A',
          overview: '',
          poster_path: null,
          backdrop_path: null,
          release_date: '2024',
          vote_average: 7,
          vote_count: 100,
          genre_ids: [],
          popularity: 50,
          adult: false,
          original_language: 'en',
          original_title: 'A',
        },
      ],
      watchlist: [],
    })
    const { result } = renderHook(() => useBrowseHandlers())
    expect(result.current.favoriteIds).toContain(10)
  })
})
