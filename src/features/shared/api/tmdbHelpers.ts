/**
 * Generic TMDB API helpers shared by the movies and TV feature layers.
 *
 * Every function is parameterized by `mediaType` so the two feature APIs can
 * stay thin wrappers that preserve their own public signatures and response
 * types without duplicating fetch logic.
 *
 * NOTE: Discover endpoints are intentionally NOT here — movies use
 * `primary_release_year` while TV uses `first_air_date_year`, so they cannot
 * share a single generic implementation without leaking media-specific params.
 */

import { tmdbFetch } from '@/lib/tmdbClient'
import type { GenreListResponse, VideoListResponse } from '@/features/movies/types/movie'

export type MediaType = 'movie' | 'tv'

// ---------------------------------------------------------------------------
// Trending
// ---------------------------------------------------------------------------

export async function fetchTrendingMedia<T>(
  mediaType: MediaType,
  timeWindow: 'day' | 'week',
  page: number,
): Promise<T> {
  return tmdbFetch(`/trending/${mediaType}/${timeWindow}`, { params: { page } })
}

// ---------------------------------------------------------------------------
// Top Rated
// ---------------------------------------------------------------------------

export async function fetchTopRatedMedia<T>(mediaType: MediaType, page: number): Promise<T> {
  return tmdbFetch(`/${mediaType}/top_rated`, { params: { page } })
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export async function fetchSearchMedia<T>(
  mediaType: MediaType,
  query: string,
  page: number,
): Promise<T> {
  return tmdbFetch(`/search/${mediaType}`, {
    params: { query, page, include_adult: false },
  })
}

// ---------------------------------------------------------------------------
// Genres
// ---------------------------------------------------------------------------

export async function fetchMediaGenres(mediaType: MediaType): Promise<GenreListResponse> {
  return tmdbFetch(`/genre/${mediaType}/list`, { params: { language: 'en-US' } })
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export async function fetchMediaDetail<T>(mediaType: MediaType, id: number): Promise<T> {
  return tmdbFetch(`/${mediaType}/${id}`, { params: { language: 'en-US' } })
}

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

export async function fetchMediaVideos(mediaType: MediaType, id: number): Promise<VideoListResponse> {
  return tmdbFetch(`/${mediaType}/${id}/videos`, { params: { language: 'en-US' } })
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export async function fetchMediaRecommendations<T>(
  mediaType: MediaType,
  id: number,
  page: number,
): Promise<T> {
  return tmdbFetch(`/${mediaType}/${id}/recommendations`, {
    params: { language: 'en-US', page },
  })
}

// ---------------------------------------------------------------------------
// Credits
// ---------------------------------------------------------------------------

export async function fetchMediaCredits<T>(mediaType: MediaType, id: number): Promise<T> {
  return tmdbFetch(`/${mediaType}/${id}/credits`, { params: { language: 'en-US' } })
}
