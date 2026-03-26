export interface Movie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  popularity: number
  adult: boolean
  original_language: string
  original_title: string
}

export interface MovieDetail {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  adult: boolean
  original_language: string
  original_title: string
  genres: Genre[]
  runtime: number | null
  tagline: string | null
  status: string
  budget: number
  revenue: number
  imdb_id: string | null
  homepage: string | null
  production_companies: ProductionCompany[]
  spoken_languages: SpokenLanguage[]
}

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

export interface ProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface SpokenLanguage {
  iso_639_1: string
  name: string
  english_name: string
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

export interface DiscoverParams {
  page?: number
  with_genres?: string
  sort_by?: string
  'vote_average.gte'?: number
  'vote_count.gte'?: number
  year?: number
  language?: string
  primary_release_year?: number
  with_original_language?: string
}

/** A single cast member as returned by the TMDB credits endpoint */
export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
  known_for_department: string
}

/** A single crew member as returned by the TMDB credits endpoint */
export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
  known_for_department: string
}

/** Response shape for the /movie/:id/credits endpoint */
export interface MovieCreditsResponse {
  id: number
  cast: CastMember[]
  crew: CrewMember[]
}

/** Full person detail as returned by the TMDB /person/:id endpoint */
export interface PersonDetail {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
  popularity: number
  imdb_id: string | null
  homepage: string | null
  also_known_as: string[]
  gender: number
}

/** A movie in a person's filmography (cast credits) */
export interface PersonCastCredit {
  id: number
  title: string
  character: string
  poster_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  adult: boolean
  original_language: string
  original_title: string
  overview: string
  backdrop_path: string | null
  genre_ids: number[]
  order?: number
}

/** A movie in a person's filmography (crew credits) */
export interface PersonCrewCredit {
  id: number
  title: string
  job: string
  department: string
  poster_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  adult: boolean
  original_language: string
  original_title: string
  overview: string
  backdrop_path: string | null
  genre_ids: number[]
}

/** Response shape for the /person/:id/movie_credits endpoint */
export interface PersonMovieCreditsResponse {
  id: number
  cast: PersonCastCredit[]
  crew: PersonCrewCredit[]
}
