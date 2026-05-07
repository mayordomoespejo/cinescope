import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchTrending,
  fetchTopRated,
  fetchDiscover,
  fetchSearchMovies,
  fetchGenres,
  fetchMovieDetail,
  fetchMovieVideos,
  fetchMovieRecommendations,
  fetchMovieCredits,
} from '@/features/movies/api/tmdbApi'

// ── Mock tmdbClient ───────────────────────────────────────────────────

vi.mock('@/lib/tmdbClient', () => ({
  tmdbFetch: vi.fn(),
}))

import { tmdbFetch } from '@/lib/tmdbClient'
const mockTmdbFetch = vi.mocked(tmdbFetch)

beforeEach(() => {
  mockTmdbFetch.mockResolvedValue({ results: [], page: 1, total_pages: 1, total_results: 0 })
})

afterEach(() => {
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────

describe('fetchTrending', () => {
  it('calls correct endpoint with default params', async () => {
    await fetchTrending()
    expect(mockTmdbFetch).toHaveBeenCalledWith('/trending/movie/day', { params: { page: 1 } })
  })

  it('passes week window', async () => {
    await fetchTrending('week', 2)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/trending/movie/week', { params: { page: 2 } })
  })
})

describe('fetchTopRated', () => {
  it('calls correct endpoint with default page', async () => {
    await fetchTopRated()
    expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1 } })
  })

  it('passes custom page', async () => {
    await fetchTopRated(3)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 3 } })
  })
})

describe('fetchDiscover', () => {
  it('calls discover endpoint with all params', async () => {
    await fetchDiscover({
      page: 2,
      with_genres: '28',
      sort_by: 'vote_average.desc',
      'vote_average.gte': 7,
      'vote_count.gte': 100,
      primary_release_year: 2023,
      with_original_language: 'en',
    })
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/discover/movie',
      expect.objectContaining({
        params: expect.objectContaining({
          page: 2,
          with_genres: '28',
          sort_by: 'vote_average.desc',
        }),
      })
    )
  })

  it('applies default sort_by when not specified', async () => {
    await fetchDiscover({ page: 1 })
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/discover/movie',
      expect.objectContaining({
        params: expect.objectContaining({ sort_by: 'popularity.desc' }),
      })
    )
  })

  it('applies default vote_count.gte when not specified', async () => {
    await fetchDiscover({ page: 1 })
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/discover/movie',
      expect.objectContaining({
        params: expect.objectContaining({ 'vote_count.gte': 50 }),
      })
    )
  })
})

describe('fetchSearchMovies', () => {
  it('calls search endpoint with query', async () => {
    await fetchSearchMovies('batman')
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/search/movie',
      expect.objectContaining({
        params: expect.objectContaining({ query: 'batman', page: 1, include_adult: false }),
      })
    )
  })

  it('passes custom page', async () => {
    await fetchSearchMovies('batman', 2)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/search/movie',
      expect.objectContaining({ params: expect.objectContaining({ page: 2 }) })
    )
  })
})

describe('fetchGenres', () => {
  it('calls genres endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ genres: [] })
    await fetchGenres()
    expect(mockTmdbFetch).toHaveBeenCalledWith('/genre/movie/list', expect.anything())
  })
})

describe('fetchMovieDetail', () => {
  it('calls movie detail endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ id: 42, title: 'Test' })
    await fetchMovieDetail(42)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/42', expect.anything())
  })
})

describe('fetchMovieVideos', () => {
  it('calls movie videos endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ results: [] })
    await fetchMovieVideos(42)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/42/videos', expect.anything())
  })
})

describe('fetchMovieRecommendations', () => {
  it('calls recommendations endpoint with default page', async () => {
    await fetchMovieRecommendations(42)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/movie/42/recommendations',
      expect.objectContaining({ params: expect.objectContaining({ page: 1 }) })
    )
  })

  it('passes custom page', async () => {
    await fetchMovieRecommendations(42, 3)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/movie/42/recommendations',
      expect.objectContaining({ params: expect.objectContaining({ page: 3 }) })
    )
  })
})

describe('fetchMovieCredits', () => {
  it('calls credits endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ id: 42, cast: [], crew: [] })
    await fetchMovieCredits(42)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/movie/42/credits', expect.anything())
  })
})
