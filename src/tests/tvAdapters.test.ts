import { describe, it, expect } from 'vitest'
import { tvShowToMovie } from '@/features/tv/adapters'
import type { TVShow } from '@/features/tv/types/tv'

function makeTVShow(overrides: Partial<TVShow> = {}): TVShow {
  return {
    id: 1,
    name: 'Breaking Bad',
    overview: 'A chemistry teacher turned drug lord.',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    first_air_date: '2008-01-20',
    vote_average: 9.5,
    vote_count: 12000,
    genre_ids: [18, 80],
    original_language: 'en',
    popularity: 300,
    ...overrides,
  }
}

describe('tvShowToMovie', () => {
  it('maps id correctly', () => {
    const movie = tvShowToMovie(makeTVShow({ id: 42 }))
    expect(movie.id).toBe(42)
  })

  it('maps name to title', () => {
    const movie = tvShowToMovie(makeTVShow({ name: 'The Wire' }))
    expect(movie.title).toBe('The Wire')
  })

  it('maps overview', () => {
    const movie = tvShowToMovie(makeTVShow({ overview: 'A great show.' }))
    expect(movie.overview).toBe('A great show.')
  })

  it('maps poster_path', () => {
    const movie = tvShowToMovie(makeTVShow({ poster_path: '/poster.jpg' }))
    expect(movie.poster_path).toBe('/poster.jpg')
  })

  it('maps null poster_path', () => {
    const movie = tvShowToMovie(makeTVShow({ poster_path: null }))
    expect(movie.poster_path).toBeNull()
  })

  it('maps backdrop_path', () => {
    const movie = tvShowToMovie(makeTVShow({ backdrop_path: '/backdrop.jpg' }))
    expect(movie.backdrop_path).toBe('/backdrop.jpg')
  })

  it('maps first_air_date to release_date', () => {
    const movie = tvShowToMovie(makeTVShow({ first_air_date: '2008-01-20' }))
    expect(movie.release_date).toBe('2008-01-20')
  })

  it('maps vote_average', () => {
    const movie = tvShowToMovie(makeTVShow({ vote_average: 8.7 }))
    expect(movie.vote_average).toBe(8.7)
  })

  it('maps vote_count', () => {
    const movie = tvShowToMovie(makeTVShow({ vote_count: 5000 }))
    expect(movie.vote_count).toBe(5000)
  })

  it('maps genre_ids', () => {
    const movie = tvShowToMovie(makeTVShow({ genre_ids: [18, 80] }))
    expect(movie.genre_ids).toEqual([18, 80])
  })

  it('maps popularity', () => {
    const movie = tvShowToMovie(makeTVShow({ popularity: 150 }))
    expect(movie.popularity).toBe(150)
  })

  it('maps original_language', () => {
    const movie = tvShowToMovie(makeTVShow({ original_language: 'ko' }))
    expect(movie.original_language).toBe('ko')
  })

  it('sets adult to false', () => {
    const movie = tvShowToMovie(makeTVShow())
    expect(movie.adult).toBe(false)
  })

  it('sets original_title to name', () => {
    const movie = tvShowToMovie(makeTVShow({ name: 'Squid Game' }))
    expect(movie.original_title).toBe('Squid Game')
  })
})
