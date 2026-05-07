import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchTrendingTV,
  fetchTopRatedTV,
  fetchDiscoverTV,
  fetchSearchTV,
  fetchTVGenres,
  fetchTVDetail,
  fetchTVVideos,
  fetchTVRecommendations,
  fetchTVCredits,
} from '@/features/tv/api/tvApi'

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

describe('fetchTrendingTV', () => {
  it('calls correct endpoint with default params', async () => {
    await fetchTrendingTV()
    expect(mockTmdbFetch).toHaveBeenCalledWith('/trending/tv/day', { params: { page: 1 } })
  })

  it('passes week window and custom page', async () => {
    await fetchTrendingTV('week', 2)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/trending/tv/week', { params: { page: 2 } })
  })
})

describe('fetchTopRatedTV', () => {
  it('calls correct endpoint with default page', async () => {
    await fetchTopRatedTV()
    expect(mockTmdbFetch).toHaveBeenCalledWith('/tv/top_rated', { params: { page: 1 } })
  })

  it('passes custom page', async () => {
    await fetchTopRatedTV(4)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/tv/top_rated', { params: { page: 4 } })
  })
})

describe('fetchDiscoverTV', () => {
  it('calls discover endpoint with params', async () => {
    await fetchDiscoverTV({ page: 1, with_genres: '18', sort_by: 'vote_average.desc' })
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/discover/tv',
      expect.objectContaining({
        params: expect.objectContaining({ with_genres: '18', sort_by: 'vote_average.desc' }),
      })
    )
  })

  it('applies default sort_by when not specified', async () => {
    await fetchDiscoverTV({ page: 1 })
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/discover/tv',
      expect.objectContaining({
        params: expect.objectContaining({ sort_by: 'popularity.desc' }),
      })
    )
  })

  it('applies default vote_count.gte', async () => {
    await fetchDiscoverTV({ page: 1 })
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/discover/tv',
      expect.objectContaining({
        params: expect.objectContaining({ 'vote_count.gte': 50 }),
      })
    )
  })
})

describe('fetchSearchTV', () => {
  it('calls search endpoint with query', async () => {
    await fetchSearchTV('breaking bad')
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/search/tv',
      expect.objectContaining({
        params: expect.objectContaining({
          query: 'breaking bad',
          page: 1,
          include_adult: false,
        }),
      })
    )
  })

  it('passes custom page', async () => {
    await fetchSearchTV('lost', 3)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/search/tv',
      expect.objectContaining({ params: expect.objectContaining({ page: 3 }) })
    )
  })
})

describe('fetchTVGenres', () => {
  it('calls genres endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ genres: [] })
    await fetchTVGenres()
    expect(mockTmdbFetch).toHaveBeenCalledWith('/genre/tv/list', expect.anything())
  })
})

describe('fetchTVDetail', () => {
  it('calls tv detail endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ id: 99, name: 'Test Show' })
    await fetchTVDetail(99)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/tv/99', expect.anything())
  })
})

describe('fetchTVVideos', () => {
  it('calls tv videos endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ results: [] })
    await fetchTVVideos(99)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/tv/99/videos', expect.anything())
  })
})

describe('fetchTVRecommendations', () => {
  it('calls recommendations endpoint with default page', async () => {
    await fetchTVRecommendations(99)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/tv/99/recommendations',
      expect.objectContaining({ params: expect.objectContaining({ page: 1 }) })
    )
  })

  it('passes custom page', async () => {
    await fetchTVRecommendations(99, 2)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/tv/99/recommendations',
      expect.objectContaining({ params: expect.objectContaining({ page: 2 }) })
    )
  })
})

describe('fetchTVCredits', () => {
  it('calls tv credits endpoint', async () => {
    mockTmdbFetch.mockResolvedValue({ cast: [], crew: [] })
    await fetchTVCredits(99)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/tv/99/credits', expect.anything())
  })
})
