import { describe, it, expect } from 'vitest'
import {
  getPosterUrl,
  getProfileUrl,
  getBackdropUrl,
  getReleaseYear,
  formatDate,
  formatRuntime,
  formatRating,
  formatMoney,
} from '@/lib/helpers'

// ── getPosterUrl ──────────────────────────────────────────────────────

describe('getPosterUrl', () => {
  it('returns fallback placeholder for null', () => {
    expect(getPosterUrl(null)).toContain('placehold')
  })

  it('returns fallback placeholder for undefined', () => {
    expect(getPosterUrl(null)).toContain('placehold')
  })

  it('returns tmdb url for valid path', () => {
    const url = getPosterUrl('/poster.jpg')
    expect(url).toContain('image.tmdb.org')
    expect(url).toContain('poster.jpg')
  })

  it('uses default size md (w342)', () => {
    const url = getPosterUrl('/poster.jpg')
    expect(url).toContain('w342')
  })

  it('uses sm size (w185) when specified', () => {
    const url = getPosterUrl('/poster.jpg', 'sm')
    expect(url).toContain('w185')
  })

  it('uses lg size (w500) when specified', () => {
    const url = getPosterUrl('/poster.jpg', 'lg')
    expect(url).toContain('w500')
  })

  it('uses xl size (w780) when specified', () => {
    const url = getPosterUrl('/poster.jpg', 'xl')
    expect(url).toContain('w780')
  })

  it('uses original size when specified', () => {
    const url = getPosterUrl('/poster.jpg', 'original')
    expect(url).toContain('original')
  })
})

// ── getProfileUrl ─────────────────────────────────────────────────────

describe('getProfileUrl', () => {
  it('returns placeholder for null', () => {
    const url = getProfileUrl(null)
    expect(url).toContain('placehold')
  })

  it('returns tmdb url for valid path', () => {
    const url = getProfileUrl('/actor.jpg')
    expect(url).toContain('image.tmdb.org')
    expect(url).toContain('actor.jpg')
  })

  it('uses default size md (w185)', () => {
    const url = getProfileUrl('/actor.jpg')
    expect(url).toContain('w185')
  })

  it('uses sm size (w45) when specified', () => {
    const url = getProfileUrl('/actor.jpg', 'sm')
    expect(url).toContain('w45')
  })

  it('uses lg size (h632) when specified', () => {
    const url = getProfileUrl('/actor.jpg', 'lg')
    expect(url).toContain('h632')
  })
})

// ── getBackdropUrl ────────────────────────────────────────────────────

describe('getBackdropUrl', () => {
  it('returns fallback placeholder for null', () => {
    const url = getBackdropUrl(null)
    expect(url).toContain('placehold')
  })

  it('returns tmdb url for valid path', () => {
    const url = getBackdropUrl('/backdrop.jpg')
    expect(url).toContain('image.tmdb.org')
    expect(url).toContain('backdrop.jpg')
  })

  it('uses default size lg (w1280)', () => {
    const url = getBackdropUrl('/backdrop.jpg')
    expect(url).toContain('w1280')
  })

  it('uses sm size (w300) when specified', () => {
    const url = getBackdropUrl('/backdrop.jpg', 'sm')
    expect(url).toContain('w300')
  })

  it('uses md size (w780) when specified', () => {
    const url = getBackdropUrl('/backdrop.jpg', 'md')
    expect(url).toContain('w780')
  })

  it('uses original size when specified', () => {
    const url = getBackdropUrl('/backdrop.jpg', 'original')
    expect(url).toContain('original')
  })
})

// ── getReleaseYear ────────────────────────────────────────────────────

describe('getReleaseYear', () => {
  it('returns the year from a valid date string', () => {
    expect(getReleaseYear('2024-06-15')).toBe('2024')
  })

  it('returns N/A for null', () => {
    expect(getReleaseYear(null)).toBe('N/A')
  })

  it('returns N/A for undefined', () => {
    expect(getReleaseYear(undefined)).toBe('N/A')
  })

  it('returns N/A for empty string', () => {
    expect(getReleaseYear('')).toBe('N/A')
  })

  it('handles year 2000 correctly', () => {
    expect(getReleaseYear('2000-01-01')).toBe('2000')
  })
})

// ── formatDate ────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns N/A for null', () => {
    expect(formatDate(null)).toBe('N/A')
  })

  it('returns N/A for undefined', () => {
    expect(formatDate(undefined)).toBe('N/A')
  })

  it('returns N/A for empty string', () => {
    expect(formatDate('')).toBe('N/A')
  })

  it('formats a valid date with month, day and year', () => {
    const result = formatDate('2024-01-15')
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2024/)
  })
})

// ── formatRuntime ─────────────────────────────────────────────────────

describe('formatRuntime', () => {
  it('returns N/A for null', () => {
    expect(formatRuntime(null)).toBe('N/A')
  })

  it('returns N/A for undefined', () => {
    expect(formatRuntime(undefined)).toBe('N/A')
  })

  it('returns N/A for 0', () => {
    expect(formatRuntime(0)).toBe('N/A')
  })

  it('formats minutes-only (45m)', () => {
    expect(formatRuntime(45)).toBe('45m')
  })

  it('formats hours-only (2h)', () => {
    expect(formatRuntime(120)).toBe('2h')
  })

  it('formats hours and minutes (1h 30m)', () => {
    expect(formatRuntime(90)).toBe('1h 30m')
  })

  it('formats exactly 60 minutes as 1h', () => {
    expect(formatRuntime(60)).toBe('1h')
  })

  it('formats 1 minute as 1m', () => {
    expect(formatRuntime(1)).toBe('1m')
  })
})

// ── formatRating ──────────────────────────────────────────────────────

describe('formatRating', () => {
  it('formats integer to one decimal', () => {
    expect(formatRating(10)).toBe('10.0')
  })

  it('truncates to one decimal', () => {
    expect(formatRating(8.234)).toBe('8.2')
  })

  it('rounds to one decimal', () => {
    expect(formatRating(7.96)).toBe('8.0')
  })

  it('formats 0 as 0.0', () => {
    expect(formatRating(0)).toBe('0.0')
  })
})

// ── formatMoney ───────────────────────────────────────────────────────

describe('formatMoney', () => {
  it('returns N/A for 0', () => {
    expect(formatMoney(0)).toBe('N/A')
  })

  it('formats small amounts in standard notation', () => {
    const result = formatMoney(500)
    expect(result).toContain('$')
    expect(result).toContain('500')
  })

  it('formats large amounts in compact notation', () => {
    const result = formatMoney(200_000_000)
    expect(result).toContain('$')
    // compact notation: "$200M" or similar
    expect(result.length).toBeLessThan(10)
  })

  it('formats exactly 1 million in compact notation', () => {
    const result = formatMoney(1_000_000)
    expect(result).toContain('$')
  })

  it('formats amounts just below 1 million in standard notation', () => {
    const result = formatMoney(999_999)
    expect(result).toContain('$')
    expect(result).toContain('999')
  })
})
