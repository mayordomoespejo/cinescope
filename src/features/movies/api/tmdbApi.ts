import { tmdbFetch } from '@/lib/tmdbClient'
import type {
  Movie,
  MovieDetail,
  PaginatedResponse,
  GenreListResponse,
  VideoListResponse,
  DiscoverParams,
} from '../types/movie'

export async function fetchTrending(
  timeWindow: 'day' | 'week' = 'day',
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  return tmdbFetch(`/trending/movie/${timeWindow}`, { params: { page } })
}

export async function fetchTopRated(page: number = 1): Promise<PaginatedResponse<Movie>> {
  return tmdbFetch('/movie/top_rated', { params: { page } })
}

export async function fetchDiscover(params: DiscoverParams): Promise<PaginatedResponse<Movie>> {
  return tmdbFetch('/discover/movie', {
    params: {
      page: params.page ?? 1,
      with_genres: params.with_genres,
      sort_by: params.sort_by ?? 'popularity.desc',
      'vote_average.gte': params['vote_average.gte'],
      'vote_count.gte': params['vote_count.gte'] ?? 50,
      language: 'en-US',
    },
  })
}

export async function fetchSearchMovies(
  query: string,
  page: number = 1
): Promise<PaginatedResponse<Movie>> {
  return tmdbFetch('/search/movie', {
    params: { query, page, include_adult: false },
  })
}

export async function fetchGenres(): Promise<GenreListResponse> {
  return tmdbFetch('/genre/movie/list', { params: { language: 'en-US' } })
}

export async function fetchMovieDetail(id: number): Promise<MovieDetail> {
  return tmdbFetch(`/movie/${id}`, { params: { language: 'en-US' } })
}

export async function fetchMovieVideos(id: number): Promise<VideoListResponse> {
  return tmdbFetch(`/movie/${id}/videos`, { params: { language: 'en-US' } })
}
