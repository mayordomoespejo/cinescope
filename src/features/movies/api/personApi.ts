import { tmdbFetch } from '@/lib/tmdbClient'
import type { PersonDetail, PersonMovieCreditsResponse } from '../types/movie'

/**
 * Fetches full person details from the TMDB /person/:id endpoint.
 * Includes biography, birthday, birthplace, profile photo, and known-for department.
 * @param personId - TMDB person ID.
 */
export async function fetchPersonDetail(personId: number): Promise<PersonDetail> {
  return tmdbFetch(`/person/${personId}`, { params: { language: 'en-US' } })
}

/**
 * Fetches all movies a person appeared in (cast) or directed/contributed to (crew).
 * @param personId - TMDB person ID.
 */
export async function fetchPersonMovieCredits(
  personId: number
): Promise<PersonMovieCreditsResponse> {
  return tmdbFetch(`/person/${personId}/movie_credits`, { params: { language: 'en-US' } })
}
