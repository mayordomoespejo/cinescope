/**
 * Shared TMDB types used across multiple feature modules.
 * Import from here — not from feature-specific files — to avoid cross-feature deps.
 */

export interface Genre {
  id: number
  name: string
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
  published_at: string
  iso_639_1: string
  iso_3166_1: string
  size: number
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
  known_for_department: string
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
  known_for_department: string
}

export interface PaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface GenreListResponse {
  genres: Genre[]
}

export interface VideoListResponse {
  id: number
  results: Video[]
}
