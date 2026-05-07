import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchTrendingMedia,
  fetchTopRatedMedia,
  fetchSearchMedia,
  fetchMediaGenres,
  fetchMediaDetail,
  fetchMediaVideos,
  fetchMediaRecommendations,
  fetchMediaCredits,
} from '@/features/shared/api/tmdbHelpers'

vi.mock('@/lib/tmdbClient', () => ({
  tmdbFetch: vi.fn(),
}))

import { tmdbFetch } from '@/lib/tmdbClient'
const mockTmdbFetch = vi.mocked(tmdbFetch)

beforeEach(() => {
  mockTmdbFetch.mockResolvedValue({ results: [] })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('fetchTrendingMedia', () => {
  it('calls correct movie trending endpoint', async () => {
    await fetchTrendingMedia('movie', 'day', 1)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/trending/movie/day', { params: { page: 1 } })
  })

  it('calls correct tv trending endpoint', async () => {
    await fetchTrendingMedia('tv', 'week', 2)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/trending/tv/week', { params: { page: 2 } })
  })
})

describe('fetchTopRatedMedia', () => {
  it('calls correct movie top_rated endpoint', async () => {
    await fetchTopRatedMedia('movie', 1)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1 } })
  })

  it('calls correct tv top_rated endpoint', async () => {
    await fetchTopRatedMedia('tv', 3)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/tv/top_rated', { params: { page: 3 } })
  })
})

describe('fetchSearchMedia', () => {
  it('calls correct movie search endpoint', async () => {
    await fetchSearchMedia('movie', 'batman', 1)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/search/movie',
      expect.objectContaining({
        params: expect.objectContaining({ query: 'batman', page: 1, include_adult: false }),
      })
    )
  })

  it('calls correct tv search endpoint', async () => {
    await fetchSearchMedia('tv', 'breaking bad', 2)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/search/tv',
      expect.objectContaining({ params: expect.objectContaining({ query: 'breaking bad' }) })
    )
  })
})

describe('fetchMediaGenres', () => {
  it('calls movie genres endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ genres: [] })
    await fetchMediaGenres('movie')
    expect(mockTmdbFetch).toHaveBeenCalledWith('/genre/movie/list', expect.anything())
  })

  it('calls tv genres endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ genres: [] })
    await fetchMediaGenres('tv')
    expect(mockTmdbFetch).toHaveBeenCalledWith('/genre/tv/list', expect.anything())
  })
})

describe('fetchMediaDetail', () => {
  it('calls movie detail endpoint', async () => {
    await fetchMediaDetail('movie', 42)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/42', expect.anything())
  })

  it('calls tv detail endpoint', async () => {
    await fetchMediaDetail('tv', 99)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/tv/99', expect.anything())
  })
})

describe('fetchMediaVideos', () => {
  it('calls movie videos endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ results: [] })
    await fetchMediaVideos('movie', 42)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/42/videos', expect.anything())
  })

  it('calls tv videos endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ results: [] })
    await fetchMediaVideos('tv', 99)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/tv/99/videos', expect.anything())
  })
})

describe('fetchMediaRecommendations', () => {
  it('calls movie recommendations endpoint', async () => {
    await fetchMediaRecommendations('movie', 42, 1)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/movie/42/recommendations',
      expect.objectContaining({ params: expect.objectContaining({ page: 1 }) })
    )
  })

  it('calls tv recommendations endpoint', async () => {
    await fetchMediaRecommendations('tv', 99, 2)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/tv/99/recommendations',
      expect.objectContaining({ params: expect.objectContaining({ page: 2 }) })
    )
  })
})

describe('fetchMediaCredits', () => {
  it('calls movie credits endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ cast: [], crew: [] })
    await fetchMediaCredits('movie', 42)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/42/credits', expect.anything())
  })

  it('calls tv credits endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ cast: [], crew: [] })
    await fetchMediaCredits('tv', 99)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/tv/99/credits', expect.anything())
  })
})
