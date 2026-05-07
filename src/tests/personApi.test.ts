import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchPersonDetail, fetchPersonMovieCredits } from '@/features/movies/api/personApi'

vi.mock('@/lib/tmdbClient', () => ({
  tmdbFetch: vi.fn(),
}))

import { tmdbFetch } from '@/lib/tmdbClient'
const mockTmdbFetch = vi.mocked(tmdbFetch)

beforeEach(() => {
  mockTmdbFetch.mockResolvedValue({})
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('fetchPersonDetail', () => {
  it('calls correct endpoint', async () => {
    await fetchPersonDetail(5)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/person/5', expect.anything())
  })

  it('includes language param', async () => {
    await fetchPersonDetail(5)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/person/5',
      expect.objectContaining({ params: expect.objectContaining({ language: 'en-US' }) })
    )
  })
})

describe('fetchPersonMovieCredits', () => {
  it('calls correct endpoint', async () => {
    await fetchPersonMovieCredits(5)
    expect(mockTmdbFetch).toHaveBeenCalledWith('/person/5/movie_credits', expect.anything())
  })

  it('includes language param', async () => {
    await fetchPersonMovieCredits(5)
    expect(mockTmdbFetch).toHaveBeenCalledWith(
      '/person/5/movie_credits',
      expect.objectContaining({ params: expect.objectContaining({ language: 'en-US' }) })
    )
  })
})
