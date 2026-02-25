import { describe, it, expect, beforeEach } from 'vitest'
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  addSearchQuery,
  getSearchHistory,
  clearSearchHistory,
} from '@/features/favorites/store'
import type { Movie } from '@/features/movies/types/movie'

const mockMovie: Movie = {
  id: 42,
  title: 'Interstellar',
  overview: 'Space adventure.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2014-11-05',
  vote_average: 8.6,
  vote_count: 30000,
  genre_ids: [18, 878],
  popularity: 90.0,
  adult: false,
  original_language: 'en',
  original_title: 'Interstellar',
}

beforeEach(() => {
  localStorage.clear()
})

describe('Favorites store', () => {
  it('starts empty', () => {
    expect(getFavorites()).toEqual([])
  })

  it('adds a favorite', () => {
    addFavorite(mockMovie)
    expect(getFavorites()).toHaveLength(1)
    expect(getFavorites()[0].id).toBe(42)
  })

  it('does not duplicate favorites', () => {
    addFavorite(mockMovie)
    addFavorite(mockMovie)
    expect(getFavorites()).toHaveLength(1)
  })

  it('removes a favorite', () => {
    addFavorite(mockMovie)
    removeFavorite(42)
    expect(getFavorites()).toHaveLength(0)
  })

  it('isFavorite returns true when saved', () => {
    addFavorite(mockMovie)
    expect(isFavorite(42)).toBe(true)
  })

  it('isFavorite returns false when not saved', () => {
    expect(isFavorite(42)).toBe(false)
  })
})

describe('Watchlist store', () => {
  it('adds to watchlist', () => {
    addToWatchlist(mockMovie)
    expect(getWatchlist()).toHaveLength(1)
  })

  it('removes from watchlist', () => {
    addToWatchlist(mockMovie)
    removeFromWatchlist(42)
    expect(getWatchlist()).toHaveLength(0)
  })

  it('isInWatchlist works correctly', () => {
    expect(isInWatchlist(42)).toBe(false)
    addToWatchlist(mockMovie)
    expect(isInWatchlist(42)).toBe(true)
  })
})

describe('Search history', () => {
  it('adds a search query', () => {
    addSearchQuery('batman')
    expect(getSearchHistory()).toContain('batman')
  })

  it('deduplicates queries', () => {
    addSearchQuery('batman')
    addSearchQuery('batman')
    expect(getSearchHistory()).toHaveLength(1)
  })

  it('clears history', () => {
    addSearchQuery('batman')
    clearSearchHistory()
    expect(getSearchHistory()).toHaveLength(0)
  })

  it('ignores empty strings', () => {
    addSearchQuery('')
    addSearchQuery('   ')
    expect(getSearchHistory()).toHaveLength(0)
  })
})
