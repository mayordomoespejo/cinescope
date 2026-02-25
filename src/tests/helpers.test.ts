import { describe, it, expect } from 'vitest'
import {
  getReleaseYear,
  formatDate,
  formatRuntime,
  formatRating,
  getPosterUrl,
  getBackdropUrl,
} from '@/lib/helpers'

describe('getReleaseYear', () => {
  it('returns the year from a valid date', () => {
    expect(getReleaseYear('2024-01-15')).toBe('2024')
  })

  it('returns N/A for null', () => {
    expect(getReleaseYear(null)).toBe('N/A')
  })

  it('returns N/A for undefined', () => {
    expect(getReleaseYear(undefined)).toBe('N/A')
  })
})

describe('formatRuntime', () => {
  it('formats 90 minutes as 1h 30m', () => {
    expect(formatRuntime(90)).toBe('1h 30m')
  })

  it('formats 60 minutes as 1h', () => {
    expect(formatRuntime(60)).toBe('1h')
  })

  it('formats 45 minutes as 45m', () => {
    expect(formatRuntime(45)).toBe('45m')
  })

  it('returns N/A for null', () => {
    expect(formatRuntime(null)).toBe('N/A')
  })
})

describe('formatRating', () => {
  it('formats 8.234 as 8.2', () => {
    expect(formatRating(8.234)).toBe('8.2')
  })

  it('formats 10 as 10.0', () => {
    expect(formatRating(10)).toBe('10.0')
  })
})

describe('formatDate', () => {
  it('formats a valid date', () => {
    const result = formatDate('2024-01-15')
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2024/)
  })

  it('returns N/A for null', () => {
    expect(formatDate(null)).toBe('N/A')
  })
})

describe('getPosterUrl', () => {
  it('returns fallback for null path', () => {
    const url = getPosterUrl(null)
    expect(url).toContain('placehold')
  })

  it('returns tmdb url for valid path', () => {
    const url = getPosterUrl('/abc.jpg')
    expect(url).toContain('image.tmdb.org')
    expect(url).toContain('abc.jpg')
  })
})

describe('getBackdropUrl', () => {
  it('returns fallback for null path', () => {
    const url = getBackdropUrl(null)
    expect(url).toContain('placehold')
  })

  it('returns tmdb url for valid path', () => {
    const url = getBackdropUrl('/backdrop.jpg')
    expect(url).toContain('image.tmdb.org')
    expect(url).toContain('backdrop.jpg')
  })
})
