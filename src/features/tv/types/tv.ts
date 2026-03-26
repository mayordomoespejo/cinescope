import type {
  Genre,
  Video,
  PaginatedResponse,
  GenreListResponse,
  VideoListResponse,
  CastMember,
  CrewMember,
} from '@/features/movies/types/movie'

export type {
  Genre,
  Video,
  PaginatedResponse,
  GenreListResponse,
  VideoListResponse,
  CastMember,
  CrewMember,
}

export interface TVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  original_language: string
  popularity: number
}

export interface Network {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface TVShowDetail {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  original_language: string
  popularity: number
  tagline: string | null
  number_of_seasons: number
  number_of_episodes: number
  status: string
  genres: Genre[]
  networks: Network[]
  episode_run_time: number[]
  created_by: TVCreator[]
}

/** Creator of a TV show as returned by TMDB detail endpoint */
export interface TVCreator {
  id: number
  name: string
  profile_path: string | null
}

/** Response shape for the /tv/:id/credits endpoint */
export interface TVCreditsResponse {
  id: number
  cast: CastMember[]
  crew: CrewMember[]
}

export interface TVDiscoverParams {
  page?: number
  with_genres?: string
  sort_by?: string
  'vote_average.gte'?: number
  'vote_count.gte'?: number
  first_air_date_year?: number
  with_original_language?: string
  language?: string
}
