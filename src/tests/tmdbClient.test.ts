import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { tmdbFetch } from '@/lib/tmdbClient'

// ── Setup ─────────────────────────────────────────────────────────────

const mockFetch = vi.fn()

beforeEach(() => {
  mockFetch.mockReset()
  vi.stubGlobal('fetch', mockFetch)
  vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', 'test-token-123')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

function makeOkResponse(data: unknown) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  } as Response
}

function makeErrorResponse(status: number, data: unknown = {}) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve(data),
  } as unknown as Response
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('tmdbFetch', () => {
  it('calls fetch with correct TMDB URL', async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ results: [] }))

    await tmdbFetch('/trending/movie/day')

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('api.themoviedb.org/3/trending/movie/day')
  })

  it('sends Bearer authorization header', async () => {
    mockFetch.mockResolvedValue(makeOkResponse({ results: [] }))

    await tmdbFetch('/movie/popular')

    const [, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toContain('Bearer')
  })

  it('returns parsed JSON on success', async () => {
    const data = { results: [{ id: 1, title: 'Test' }] }
    mockFetch.mockResolvedValue(makeOkResponse(data))

    const result = await tmdbFetch<typeof data>('/movie/popular')
    expect(result).toEqual(data)
  })

  it('appends query params to URL', async () => {
    mockFetch.mockResolvedValue(makeOkResponse({}))

    await tmdbFetch('/discover/movie', { params: { page: 2, language: 'en' } })

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('page=2')
    expect(url).toContain('language=en')
  })

  it('omits undefined params', async () => {
    mockFetch.mockResolvedValue(makeOkResponse({}))

    await tmdbFetch('/discover/movie', { params: { page: 1, with_genres: undefined } })

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).not.toContain('with_genres')
    expect(url).toContain('page=1')
  })

  it('omits empty string params', async () => {
    mockFetch.mockResolvedValue(makeOkResponse({}))

    await tmdbFetch('/discover/movie', { params: { page: 1, sort_by: '' } })

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).not.toContain('sort_by')
  })

  it('throws with status_message on API error', async () => {
    mockFetch.mockResolvedValue(makeErrorResponse(401, { status_message: 'Invalid API key' }))

    await expect(tmdbFetch('/movie/popular')).rejects.toThrow('Invalid API key')
  })

  it('throws with generic message when no status_message in error', async () => {
    mockFetch.mockResolvedValue(makeErrorResponse(500, {}))

    await expect(tmdbFetch('/movie/popular')).rejects.toThrow('TMDB error 500')
  })

  it('throws with generic message when error body is not parseable', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.reject(new Error('not json')),
    } as unknown as Response)

    await expect(tmdbFetch('/movie/popular')).rejects.toThrow('TMDB error 503')
  })

  it('converts boolean params to strings', async () => {
    mockFetch.mockResolvedValue(makeOkResponse({}))

    await tmdbFetch('/search/movie', { params: { include_adult: false } })

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('include_adult=false')
  })
})
