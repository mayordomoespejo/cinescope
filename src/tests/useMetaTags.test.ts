import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMetaTags } from '@/features/movies/hooks/useMetaTags'
import type { MovieDetail } from '@/features/movies/types/movie'

function makeMovieDetail(overrides: Partial<MovieDetail> = {}): MovieDetail {
  return {
    id: 1,
    title: 'Inception',
    overview: 'A thief steals secrets through dream-sharing technology.',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2010-07-16',
    vote_average: 8.4,
    vote_count: 32000,
    popularity: 200,
    adult: false,
    original_language: 'en',
    original_title: 'Inception',
    genres: [],
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
    status: 'Released',
    budget: 160000000,
    revenue: 836800000,
    imdb_id: 'tt1375666',
    homepage: null,
    production_companies: [],
    spoken_languages: [],
    ...overrides,
  }
}

beforeEach(() => {
  document.title = ''
  document.head.innerHTML = ''
})

describe('useMetaTags', () => {
  it('sets document.title when movie is provided', () => {
    renderHook(() => useMetaTags(makeMovieDetail({ title: 'Inception' })))
    expect(document.title).toBe('Inception | CineScope')
  })

  it('resets title to default when movie is undefined', () => {
    renderHook(() => useMetaTags(undefined))
    expect(document.title).toBe('CineScope — Discover Movies')
  })

  it('sets og:title meta tag', () => {
    renderHook(() => useMetaTags(makeMovieDetail({ title: 'Inception' })))
    const el = document.querySelector('meta[property="og:title"]')
    expect(el?.getAttribute('content')).toBe('Inception | CineScope')
  })

  it('sets og:description from overview', () => {
    renderHook(() => useMetaTags(makeMovieDetail({ overview: 'A great film.' })))
    const el = document.querySelector('meta[property="og:description"]')
    expect(el?.getAttribute('content')).toBe('A great film.')
  })

  it('truncates long overview at 200 chars', () => {
    const longOverview = 'x'.repeat(250)
    renderHook(() => useMetaTags(makeMovieDetail({ overview: longOverview })))
    const el = document.querySelector('meta[property="og:description"]')
    const content = el?.getAttribute('content') ?? ''
    expect(content.length).toBeLessThanOrEqual(200)
    expect(content.endsWith('...')).toBe(true)
  })

  it('falls back to default description for empty overview', () => {
    renderHook(() => useMetaTags(makeMovieDetail({ overview: '' })))
    const el = document.querySelector('meta[property="og:description"]')
    expect(el?.getAttribute('content')).toContain('CineScope')
  })

  it('sets og:image from backdrop_path', () => {
    renderHook(() => useMetaTags(makeMovieDetail({ backdrop_path: '/back.jpg' })))
    const el = document.querySelector('meta[property="og:image"]')
    expect(el?.getAttribute('content')).toContain('back.jpg')
  })

  it('sets og:image to empty when backdrop_path is null', () => {
    renderHook(() => useMetaTags(makeMovieDetail({ backdrop_path: null })))
    const el = document.querySelector('meta[property="og:image"]')
    expect(el?.getAttribute('content')).toBe('')
  })

  it('resets og:description to default when movie is undefined', () => {
    renderHook(() => useMetaTags(undefined))
    const el = document.querySelector('meta[property="og:description"]')
    expect(el?.getAttribute('content')).toContain('CineScope')
  })

  it('updates existing meta tags instead of creating duplicates', () => {
    const { rerender } = renderHook(({ movie }: { movie?: MovieDetail }) => useMetaTags(movie), {
      initialProps: { movie: makeMovieDetail({ title: 'Movie A' }) },
    })
    rerender({ movie: makeMovieDetail({ title: 'Movie B' }) })

    const all = document.querySelectorAll('meta[property="og:title"]')
    expect(all).toHaveLength(1)
    expect(all[0].getAttribute('content')).toBe('Movie B | CineScope')
  })
})
