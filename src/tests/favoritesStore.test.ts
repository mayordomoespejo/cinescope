import { describe, it, expect, beforeEach } from 'vitest'
import { useFavoritesStore } from '@/features/favorites/store'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'

function makeMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: 'Test Movie',
    overview: 'Overview',
    poster_path: null,
    backdrop_path: null,
    release_date: '2024-01-01',
    vote_average: 8,
    vote_count: 100,
    genre_ids: [],
    popularity: 50,
    adult: false,
    original_language: 'en',
    original_title: 'Test Movie',
    ...overrides,
  }
}

function makeTVShow(overrides: Partial<TVShow> = {}): TVShow {
  return {
    id: 10,
    name: 'Test Show',
    overview: 'Overview',
    poster_path: null,
    backdrop_path: null,
    first_air_date: '2020-01-01',
    vote_average: 7,
    vote_count: 200,
    genre_ids: [],
    original_language: 'en',
    popularity: 100,
    ...overrides,
  }
}

beforeEach(() => {
  useFavoritesStore.setState({ favorites: [], watchlist: [] })
  localStorage.clear()
})

describe('toggleFavorite with Movie', () => {
  it('adds a movie to favorites', () => {
    const movie = makeMovie()
    useFavoritesStore.getState().toggleFavorite(movie)
    expect(useFavoritesStore.getState().favorites).toHaveLength(1)
    expect(useFavoritesStore.getState().favorites[0].id).toBe(1)
  })

  it('removes a movie already in favorites', () => {
    const movie = makeMovie()
    useFavoritesStore.setState({ favorites: [movie], watchlist: [] })
    useFavoritesStore.getState().toggleFavorite(movie)
    expect(useFavoritesStore.getState().favorites).toHaveLength(0)
  })

  it('prepends movie to favorites', () => {
    const movie1 = makeMovie({ id: 1 })
    const movie2 = makeMovie({ id: 2 })
    useFavoritesStore.getState().toggleFavorite(movie1)
    useFavoritesStore.getState().toggleFavorite(movie2)
    expect(useFavoritesStore.getState().favorites[0].id).toBe(2)
  })
})

describe('toggleFavorite with TVShow', () => {
  it('converts TVShow to Movie and adds to favorites', () => {
    const show = makeTVShow({ id: 10, name: 'Breaking Bad' })
    useFavoritesStore.getState().toggleFavorite(show)
    const { favorites } = useFavoritesStore.getState()
    expect(favorites).toHaveLength(1)
    expect(favorites[0].id).toBe(10)
    expect(favorites[0].title).toBe('Breaking Bad')
  })

  it('removes TVShow from favorites when already present', () => {
    const show = makeTVShow({ id: 10 })
    useFavoritesStore.getState().toggleFavorite(show)
    useFavoritesStore.getState().toggleFavorite(show)
    expect(useFavoritesStore.getState().favorites).toHaveLength(0)
  })
})

describe('toggleWatchlist', () => {
  it('adds a movie to watchlist', () => {
    const movie = makeMovie()
    useFavoritesStore.getState().toggleWatchlist(movie)
    expect(useFavoritesStore.getState().watchlist).toHaveLength(1)
  })

  it('removes a movie already in watchlist', () => {
    const movie = makeMovie()
    useFavoritesStore.setState({ favorites: [], watchlist: [movie] })
    useFavoritesStore.getState().toggleWatchlist(movie)
    expect(useFavoritesStore.getState().watchlist).toHaveLength(0)
  })
})

describe('isFavorite', () => {
  it('returns true when movie is in favorites', () => {
    const movie = makeMovie({ id: 5 })
    useFavoritesStore.setState({ favorites: [movie], watchlist: [] })
    expect(useFavoritesStore.getState().isFavorite(5)).toBe(true)
  })

  it('returns false when movie is not in favorites', () => {
    expect(useFavoritesStore.getState().isFavorite(999)).toBe(false)
  })
})

describe('isInWatchlist', () => {
  it('returns true when movie is in watchlist', () => {
    const movie = makeMovie({ id: 7 })
    useFavoritesStore.setState({ favorites: [], watchlist: [movie] })
    expect(useFavoritesStore.getState().isInWatchlist(7)).toBe(true)
  })

  it('returns false when movie is not in watchlist', () => {
    expect(useFavoritesStore.getState().isInWatchlist(999)).toBe(false)
  })
})

describe('reorderFavorites', () => {
  it('sets favorites to new order', () => {
    const a = makeMovie({ id: 1 })
    const b = makeMovie({ id: 2 })
    useFavoritesStore.setState({ favorites: [a, b], watchlist: [] })
    useFavoritesStore.getState().reorderFavorites([b, a])
    expect(useFavoritesStore.getState().favorites[0].id).toBe(2)
    expect(useFavoritesStore.getState().favorites[1].id).toBe(1)
  })
})

describe('reorderWatchlist', () => {
  it('sets watchlist to new order', () => {
    const a = makeMovie({ id: 1 })
    const b = makeMovie({ id: 2 })
    useFavoritesStore.setState({ favorites: [], watchlist: [a, b] })
    useFavoritesStore.getState().reorderWatchlist([b, a])
    expect(useFavoritesStore.getState().watchlist[0].id).toBe(2)
  })
})
