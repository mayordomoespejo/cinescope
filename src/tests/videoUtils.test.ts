import { describe, it, expect } from 'vitest'
import { pickTrailer } from '@/lib/videoUtils'
import type { Video } from '@/features/movies/types/movie'

// ── Fixtures ──────────────────────────────────────────────────────────

function makeVideo(overrides: Partial<Video>): Video {
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

// ── Tests ─────────────────────────────────────────────────────────────

describe('pickTrailer', () => {
  it('returns the official YouTube Trailer when available', () => {
    const official = makeVideo({ id: 'official', official: true, type: 'Trailer' })
    const unofficial = makeVideo({ id: 'unofficial', official: false, type: 'Trailer' })
    const teaser = makeVideo({ id: 'teaser', type: 'Teaser', official: false })

    const result = pickTrailer([teaser, unofficial, official])

    expect(result).toBe(official)
  })

  it('prefers official over unofficial trailer', () => {
    const unofficial = makeVideo({ id: 'unofficial', official: false })
    const official = makeVideo({ id: 'official', official: true })

    expect(pickTrailer([unofficial, official])).toBe(official)
  })

  it('falls back to unofficial YouTube Trailer when no official exists', () => {
    const unofficial = makeVideo({ id: 'unofficial', official: false, type: 'Trailer' })
    const teaser = makeVideo({ id: 'teaser', type: 'Teaser', official: false })

    const result = pickTrailer([teaser, unofficial])

    expect(result).toBe(unofficial)
  })

  it('falls back to YouTube Teaser when no Trailer exists', () => {
    const teaser = makeVideo({ id: 'teaser', type: 'Teaser', official: false })

    const result = pickTrailer([teaser])

    expect(result).toBe(teaser)
  })

  it('returns null for an empty array', () => {
    expect(pickTrailer([])).toBeNull()
  })

  it('returns null when no YouTube videos are present', () => {
    const vimeo = makeVideo({ site: 'Vimeo', type: 'Trailer', official: true })

    expect(pickTrailer([vimeo])).toBeNull()
  })

  it('returns null when only non-Trailer non-Teaser YouTube videos are present', () => {
    const featurette = makeVideo({ type: 'Featurette' })
    const clip = makeVideo({ type: 'Clip' })

    expect(pickTrailer([featurette, clip])).toBeNull()
  })

  it('does not return a Vimeo teaser as fallback', () => {
    const vimeoTeaser = makeVideo({ site: 'Vimeo', type: 'Teaser' })

    expect(pickTrailer([vimeoTeaser])).toBeNull()
  })
})
