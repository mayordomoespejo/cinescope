import { describe, it, expect } from 'vitest'
import { queryKeys } from '@/lib/queryKeys'
import type { DiscoverParams } from '@/features/movies/types/movie'
import type { TVDiscoverParams } from '@/features/tv/types/tv'

// ── Movie query keys ──────────────────────────────────────────────────

describe('queryKeys.trending', () => {
  it('defaults to day window', () => {
    expect(queryKeys.trending()).toEqual(['trending', 'day'])
  })

  it('accepts week window', () => {
    expect(queryKeys.trending('week')).toEqual(['trending', 'week'])
  })
})

describe('queryKeys.topRated', () => {
  it('defaults to page 1', () => {
    expect(queryKeys.topRated()).toEqual(['movie', 'topRated', 1])
  })

  it('accepts custom page', () => {
    expect(queryKeys.topRated(3)).toEqual(['movie', 'topRated', 3])
  })
})

describe('queryKeys.discover', () => {
  it('includes all params in the key', () => {
    const params: DiscoverParams = {
      page: 2,
      with_genres: '28',
      sort_by: 'popularity.desc',
      'vote_average.gte': 7,
      'vote_count.gte': 100,
      year: 2023,
      language: 'en',
      primary_release_year: 2023,
      with_original_language: 'en',
    }
    const key = queryKeys.discover(params)
    expect(key[0]).toBe('discover')
    expect(key).toContain(2)
    expect(key).toContain('28')
    expect(key).toContain('popularity.desc')
  })

  it('handles minimal params', () => {
    const params: DiscoverParams = { page: 1 }
    const key = queryKeys.discover(params)
    expect(key[0]).toBe('discover')
    expect(key[1]).toBe(1)
  })
})

describe('queryKeys.search', () => {
  it('defaults to page 1', () => {
    expect(queryKeys.search('batman')).toEqual(['search', 'batman', 1])
  })

  it('accepts custom page', () => {
    expect(queryKeys.search('batman', 2)).toEqual(['search', 'batman', 2])
  })
})

describe('queryKeys.genres', () => {
  it('returns genres key', () => {
    expect(queryKeys.genres()).toEqual(['genres'])
  })
})

describe('queryKeys.movieDetail', () => {
  it('returns movie detail key', () => {
    expect(queryKeys.movieDetail(42)).toEqual(['movie', 42])
  })
})

describe('queryKeys.movieVideos', () => {
  it('returns movie videos key', () => {
    expect(queryKeys.movieVideos(42)).toEqual(['movie', 42, 'videos'])
  })
})

describe('queryKeys.movieCredits', () => {
  it('returns movie credits key', () => {
    expect(queryKeys.movieCredits(42)).toEqual(['movie', 42, 'credits'])
  })
})

describe('queryKeys.movieRecommendations', () => {
  it('defaults to page 1', () => {
    expect(queryKeys.movieRecommendations(42)).toEqual(['movie', 42, 'recommendations', 1])
  })

  it('accepts custom page', () => {
    expect(queryKeys.movieRecommendations(42, 2)).toEqual(['movie', 42, 'recommendations', 2])
  })
})

describe('queryKeys.personDetail', () => {
  it('returns person detail key', () => {
    expect(queryKeys.personDetail(7)).toEqual(['person', 7])
  })
})

describe('queryKeys.personMovieCredits', () => {
  it('returns person movie credits key', () => {
    expect(queryKeys.personMovieCredits(7)).toEqual(['person', 7, 'movie_credits'])
  })
})

// ── TV query keys ─────────────────────────────────────────────────────

describe('queryKeys.tvTrending', () => {
  it('defaults to day window and page 1', () => {
    expect(queryKeys.tvTrending()).toEqual(['tv', 'trending', 'day', 1])
  })

  it('accepts week and custom page', () => {
    expect(queryKeys.tvTrending('week', 2)).toEqual(['tv', 'trending', 'week', 2])
  })
})

describe('queryKeys.tvTopRated', () => {
  it('defaults to page 1', () => {
    expect(queryKeys.tvTopRated()).toEqual(['tv', 'topRated', 1])
  })

  it('accepts custom page', () => {
    expect(queryKeys.tvTopRated(5)).toEqual(['tv', 'topRated', 5])
  })
})

describe('queryKeys.tvDiscover', () => {
  it('includes all params in the key', () => {
    const params: TVDiscoverParams = {
      page: 1,
      with_genres: '18',
      sort_by: 'vote_average.desc',
      'vote_average.gte': 8,
      'vote_count.gte': 50,
      first_air_date_year: 2022,
      with_original_language: 'ko',
      language: 'en',
    }
    const key = queryKeys.tvDiscover(params)
    expect(key[0]).toBe('tv')
    expect(key[1]).toBe('discover')
    expect(key).toContain('18')
    expect(key).toContain('vote_average.desc')
  })

  it('handles minimal params', () => {
    const params: TVDiscoverParams = { page: 1 }
    const key = queryKeys.tvDiscover(params)
    expect(key[0]).toBe('tv')
    expect(key[1]).toBe('discover')
    expect(key[2]).toBe(1)
  })
})

describe('queryKeys.tvSearch', () => {
  it('defaults to page 1', () => {
    expect(queryKeys.tvSearch('breaking bad')).toEqual(['tv', 'search', 'breaking bad', 1])
  })

  it('accepts custom page', () => {
    expect(queryKeys.tvSearch('breaking bad', 3)).toEqual(['tv', 'search', 'breaking bad', 3])
  })
})

describe('queryKeys.tvGenres', () => {
  it('returns tv genres key', () => {
    expect(queryKeys.tvGenres()).toEqual(['tv', 'genres'])
  })
})

describe('queryKeys.tvDetail', () => {
  it('returns tv detail key', () => {
    expect(queryKeys.tvDetail(99)).toEqual(['tv', 99])
  })
})

describe('queryKeys.tvVideos', () => {
  it('returns tv videos key', () => {
    expect(queryKeys.tvVideos(99)).toEqual(['tv', 99, 'videos'])
  })
})

describe('queryKeys.tvRecommendations', () => {
  it('defaults to page 1', () => {
    expect(queryKeys.tvRecommendations(99)).toEqual(['tv', 99, 'recommendations', 1])
  })

  it('accepts custom page', () => {
    expect(queryKeys.tvRecommendations(99, 4)).toEqual(['tv', 99, 'recommendations', 4])
  })
})

describe('queryKeys.tvCredits', () => {
  it('returns tv credits key', () => {
    expect(queryKeys.tvCredits(99)).toEqual(['tv', 99, 'credits'])
  })
})
