import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePersonFilmography, FilmographyTab } from '@/features/movies/hooks/usePersonFilmography'
import type { PersonCastCredit, PersonCrewCredit } from '@/features/movies/types/movie'

function makeCast(overrides: Partial<PersonCastCredit> = {}): PersonCastCredit {
  return {
    id: 1,
    title: 'The Movie',
    character: 'Hero',
    poster_path: null,
    release_date: '2020-01-01',
    vote_average: 7,
    vote_count: 100,
    popularity: 50,
    adult: false,
    original_language: 'en',
    original_title: 'The Movie',
    overview: '',
    backdrop_path: null,
    genre_ids: [],
    ...overrides,
  }
}

function makeCrew(overrides: Partial<PersonCrewCredit> = {}): PersonCrewCredit {
  return {
    id: 1,
    title: 'The Movie',
    job: 'Director',
    department: 'Directing',
    poster_path: null,
    release_date: '2020-01-01',
    vote_average: 7,
    vote_count: 100,
    popularity: 50,
    adult: false,
    original_language: 'en',
    original_title: 'The Movie',
    overview: '',
    backdrop_path: null,
    genre_ids: [],
    ...overrides,
  }
}

describe('usePersonFilmography', () => {
  it('returns empty arrays when credits is undefined', () => {
    const { result } = renderHook(() => usePersonFilmography(undefined))
    expect(result.current.knownFor).toEqual([])
    expect(result.current.actingCredits).toEqual([])
    expect(result.current.directingCredits).toEqual([])
    expect(result.current.writingCredits).toEqual([])
  })

  it('defaults to acting tab', () => {
    const { result } = renderHook(() => usePersonFilmography(undefined))
    expect(result.current.activeTab).toBe(FilmographyTab.ACTING)
  })

  it('computes knownFor as top 8 by popularity', () => {
    const cast = Array.from({ length: 10 }, (_, i) =>
      makeCast({ id: i, popularity: i * 10, title: `Movie ${i}` })
    )
    const { result } = renderHook(() => usePersonFilmography({ cast, crew: [] }))
    expect(result.current.knownFor).toHaveLength(8)
    expect(result.current.knownFor[0].popularity).toBe(90) // highest
  })

  it('sorts acting credits by release_date descending', () => {
    const cast = [
      makeCast({ id: 1, release_date: '2018-01-01', title: 'Old' }),
      makeCast({ id: 2, release_date: '2023-01-01', title: 'New' }),
    ]
    const { result } = renderHook(() => usePersonFilmography({ cast, crew: [] }))
    expect(result.current.actingCredits[0].title).toBe('New')
    expect(result.current.actingCredits[1].title).toBe('Old')
  })

  it('filters directing credits to Director job', () => {
    const crew = [
      makeCrew({ id: 1, job: 'Director', title: 'Film A' }),
      makeCrew({ id: 2, job: 'Producer', title: 'Film B' }),
    ]
    const { result } = renderHook(() => usePersonFilmography({ cast: [], crew }))
    expect(result.current.directingCredits).toHaveLength(1)
    expect(result.current.directingCredits[0].title).toBe('Film A')
  })

  it('filters writing credits to Writer, Screenplay, or Writing dept', () => {
    const crew = [
      makeCrew({ id: 1, job: 'Writer', title: 'Film A', department: 'Other' }),
      makeCrew({ id: 2, job: 'Screenplay', title: 'Film B', department: 'Other' }),
      makeCrew({ id: 3, job: 'Story', title: 'Film C', department: 'Writing' }),
      makeCrew({ id: 4, job: 'Producer', title: 'Film D', department: 'Production' }),
    ]
    const { result } = renderHook(() => usePersonFilmography({ cast: [], crew }))
    expect(result.current.writingCredits).toHaveLength(3)
  })

  it('auto-selects directing tab when no acting credits', async () => {
    const crew = [makeCrew({ id: 1, job: 'Director', title: 'Film A' })]
    const { result } = renderHook(() => usePersonFilmography({ cast: [], crew }))
    await waitFor(() => {
      expect(result.current.activeTab).toBe(FilmographyTab.DIRECTING)
    })
  })

  it('allows manually setting the active tab', () => {
    const { result } = renderHook(() => usePersonFilmography(undefined))
    act(() => {
      result.current.setActiveTab(FilmographyTab.WRITING)
    })
    expect(result.current.activeTab).toBe(FilmographyTab.WRITING)
  })

  it('handles cast credits with null release_date in sort', () => {
    const cast = [
      makeCast({ id: 1, release_date: '' as string }),
      makeCast({ id: 2, release_date: '2023-01-01' }),
    ]
    const { result } = renderHook(() => usePersonFilmography({ cast, crew: [] }))
    // Should not throw; newer date first
    expect(result.current.actingCredits).toHaveLength(2)
  })
})
