import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { useFavoritesStore } from '@/features/favorites/store'
import type { Movie } from '@/features/movies/types/movie'

const movieA: Movie = {
  id: 1,
  title: 'Movie A',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2024-01-01',
  vote_average: 7,
  vote_count: 100,
  genre_ids: [],
  popularity: 10,
  adult: false,
  original_language: 'en',
  original_title: 'Movie A',
}

const movieB: Movie = {
  id: 2,
  title: 'Movie B',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2024-02-01',
  vote_average: 8,
  vote_count: 200,
  genre_ids: [],
  popularity: 20,
  adult: false,
  original_language: 'en',
  original_title: 'Movie B',
}

beforeEach(() => {
  // Reset Zustand store between tests
  useFavoritesStore.setState({ favorites: [], watchlist: [] })
  localStorage.clear()
})

describe('useFavorites', () => {
  describe('initial state', () => {
    it('starts with empty favorites and watchlist', () => {
      const { result } = renderHook(() => useFavorites())
      expect(result.current.favorites).toEqual([])
      expect(result.current.watchlist).toEqual([])
    })
  })

  describe('toggleFavorite', () => {
    it('adds a movie when it is not in favorites', () => {
      const { result } = renderHook(() => useFavorites())

      act(() => {
        result.current.toggleFavorite(movieA)
      })

      expect(result.current.favorites).toContainEqual(movieA)
      expect(result.current.isFavorite(movieA.id)).toBe(true)
    })

    it('removes a movie when it is already in favorites', () => {
      useFavoritesStore.setState({ favorites: [movieA] })
      const { result } = renderHook(() => useFavorites())

      act(() => {
        result.current.toggleFavorite(movieA)
      })

      expect(result.current.favorites).not.toContainEqual(movieA)
      expect(result.current.isFavorite(movieA.id)).toBe(false)
    })
  })

  describe('toggleWatchlist', () => {
    it('adds a movie when it is not in the watchlist', () => {
      const { result } = renderHook(() => useFavorites())

      act(() => {
        result.current.toggleWatchlist(movieB)
      })

      expect(result.current.watchlist).toContainEqual(movieB)
      expect(result.current.isInWatchlist(movieB.id)).toBe(true)
    })

    it('removes a movie when it is already in the watchlist', () => {
      useFavoritesStore.setState({ watchlist: [movieB] })
      const { result } = renderHook(() => useFavorites())

      act(() => {
        result.current.toggleWatchlist(movieB)
      })

      expect(result.current.watchlist).not.toContainEqual(movieB)
      expect(result.current.isInWatchlist(movieB.id)).toBe(false)
    })
  })

  describe('reorder', () => {
    it('reorderFavorites updates the order', () => {
      useFavoritesStore.setState({ favorites: [movieA, movieB] })
      const { result } = renderHook(() => useFavorites())

      act(() => {
        result.current.reorderFavorites([movieB, movieA])
      })

      expect(result.current.favorites[0]).toEqual(movieB)
      expect(result.current.favorites[1]).toEqual(movieA)
    })

    it('reorderWatchlist updates the order', () => {
      useFavoritesStore.setState({ watchlist: [movieA, movieB] })
      const { result } = renderHook(() => useFavorites())

      act(() => {
        result.current.reorderWatchlist([movieB, movieA])
      })

      expect(result.current.watchlist[0]).toEqual(movieB)
    })
  })
})
