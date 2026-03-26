import { tmdbFetch } from '@/lib/tmdbClient'
import type {
  TVShow,
  TVShowDetail,
  TVDiscoverParams,
  PaginatedResponse,
  GenreListResponse,
  VideoListResponse,
  TVCreditsResponse,
} from '../types/tv'

export async function fetchTrendingTV(
  timeWindow: 'day' | 'week' = 'day',
  page: number = 1
): Promise<PaginatedResponse<TVShow>> {
  return tmdbFetch(`/trending/tv/${timeWindow}`, { params: { page } })
}

export async function fetchTopRatedTV(page: number = 1): Promise<PaginatedResponse<TVShow>> {
  return tmdbFetch('/tv/top_rated', { params: { page } })
}

export async function fetchDiscoverTV(
  params: TVDiscoverParams
): Promise<PaginatedResponse<TVShow>> {
  return tmdbFetch('/discover/tv', {
    params: {
      page: params.page ?? 1,
      with_genres: params.with_genres,
      sort_by: params.sort_by ?? 'popularity.desc',
      'vote_average.gte': params['vote_average.gte'],
      'vote_count.gte': params['vote_count.gte'] ?? 50,
      first_air_date_year: params.first_air_date_year,
      with_original_language: params.with_original_language,
      language: 'en-US',
    },
  })
}

export async function fetchSearchTV(
  query: string,
  page: number = 1
): Promise<PaginatedResponse<TVShow>> {
  return tmdbFetch('/search/tv', {
    params: { query, page, include_adult: false },
  })
}

export async function fetchTVGenres(): Promise<GenreListResponse> {
  return tmdbFetch('/genre/tv/list', { params: { language: 'en-US' } })
}

export async function fetchTVDetail(id: number): Promise<TVShowDetail> {
  return tmdbFetch(`/tv/${id}`, { params: { language: 'en-US' } })
}

export async function fetchTVVideos(id: number): Promise<VideoListResponse> {
  return tmdbFetch(`/tv/${id}/videos`, { params: { language: 'en-US' } })
}

/**
 * Fetches TV show recommendations from TMDB.
 * @param tvId - TMDB TV show ID.
 * @param page - Page number (default 1).
 */
export async function fetchTVRecommendations(
  tvId: number,
  page: number = 1
): Promise<PaginatedResponse<TVShow>> {
  return tmdbFetch(`/tv/${tvId}/recommendations`, { params: { page, language: 'en-US' } })
}

/**
 * Fetches the cast and crew for a TV show from TMDB.
 * @param tvId - TMDB TV show ID.
 */
export async function fetchTVCredits(tvId: number): Promise<TVCreditsResponse> {
  return tmdbFetch(`/tv/${tvId}/credits`, { params: { language: 'en-US' } })
}
