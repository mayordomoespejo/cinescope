import type { TVShow } from './types/tv'
import type { Movie } from '@/features/movies/types/movie'

/**
 * Converts a TVShow to a Movie-compatible shape for useFavorites.
 * TVShow fields mapped: id, name→title, first_air_date→release_date.
 * Missing Movie fields are filled with safe defaults.
 */
export function tvShowToMovie(show: TVShow): Movie {
  return {
    id: show.id,
    title: show.name,
    overview: show.overview,
    poster_path: show.poster_path,
    backdrop_path: show.backdrop_path,
    release_date: show.first_air_date,
    vote_average: show.vote_average,
    vote_count: show.vote_count,
    genre_ids: show.genre_ids,
    popularity: show.popularity,
    adult: false,
    original_language: show.original_language,
    original_title: show.name,
  }
}
