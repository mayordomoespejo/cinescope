import { describe, it, expect } from 'vitest'
import { getYouTubeEmbedUrl, pickTrailer } from '@/lib/videoUtils'
import type { Video } from '@/features/movies/types/movie'

// ── Fixtures ──────────────────────────────────────────────────────────

function makeVideo(overrides: Partial<Video> = {}): Video {
  return {
    id: 'v1',
    key: 'abc123',
    name: 'Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
    published_at: '2024-01-01T00:00:00.000Z',
    iso_639_1: 'en',
    iso_3166_1: 'US',
    size: 1080,
    ...overrides,
  }
}

// ── getYouTubeEmbedUrl ────────────────────────────────────────────────

describe('getYouTubeEmbedUrl', () => {
  it('returns a valid embed URL for a valid key', () => {
    const url = getYouTubeEmbedUrl('dQw4w9WgXcQ')
    expect(url).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1')
  })

  it('accepts keys with underscores and hyphens', () => {
    const url = getYouTubeEmbedUrl('abc-123_XYZ')
    expect(url).toContain('abc-123_XYZ')
  })

  it('throws for key with spaces', () => {
    expect(() => getYouTubeEmbedUrl('invalid key')).toThrow('Invalid YouTube key')
  })

  it('throws for key with special characters', () => {
    expect(() => getYouTubeEmbedUrl('abc!@#')).toThrow('Invalid YouTube key')
  })

  it('throws for empty string', () => {
    expect(() => getYouTubeEmbedUrl('')).toThrow('Invalid YouTube key')
  })
})

// ── pickTrailer ───────────────────────────────────────────────────────

describe('pickTrailer', () => {
  it('returns null for empty array', () => {
    expect(pickTrailer([])).toBeNull()
  })

  it('returns null when no YouTube videos present', () => {
    const vimeo = makeVideo({ site: 'Vimeo', official: true })
    expect(pickTrailer([vimeo])).toBeNull()
  })

  it('returns null when only non-Trailer non-Teaser YouTube videos exist', () => {
    const featurette = makeVideo({ type: 'Featurette' })
    const clip = makeVideo({ type: 'Clip' })
    expect(pickTrailer([featurette, clip])).toBeNull()
  })

  it('returns the official YouTube trailer', () => {
    const official = makeVideo({ id: 'official', official: true, type: 'Trailer' })
    const unofficial = makeVideo({ id: 'unofficial', official: false, type: 'Trailer' })
    const teaser = makeVideo({ id: 'teaser', type: 'Teaser', official: false })

    expect(pickTrailer([teaser, unofficial, official])).toBe(official)
  })

  it('prefers official over unofficial trailer', () => {
    const unofficial = makeVideo({ id: 'unofficial', official: false })
    const official = makeVideo({ id: 'official', official: true })
    expect(pickTrailer([unofficial, official])).toBe(official)
  })

  it('falls back to unofficial YouTube trailer when no official exists', () => {
    const unofficial = makeVideo({ id: 'unofficial', official: false, type: 'Trailer' })
    const teaser = makeVideo({ id: 'teaser', type: 'Teaser', official: false })
    expect(pickTrailer([teaser, unofficial])).toBe(unofficial)
  })

  it('falls back to YouTube teaser when no trailer exists', () => {
    const teaser = makeVideo({ id: 'teaser', type: 'Teaser', official: false })
    expect(pickTrailer([teaser])).toBe(teaser)
  })

  it('does not return Vimeo teaser as fallback', () => {
    const vimeoTeaser = makeVideo({ site: 'Vimeo', type: 'Teaser' })
    expect(pickTrailer([vimeoTeaser])).toBeNull()
  })
})
