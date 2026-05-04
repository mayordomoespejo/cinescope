import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'

/** Discriminated union for media type across the app */
export type MediaType = 'movie' | 'tv'

/**
 * Alias for Movie used in the favorites store context.
 * Favorites are stored as TMDB movie objects.
 */
export type FavoriteItem = Movie

/**
 * Generic media item wrapper with type discriminator.
 * Used to associate a TMDB ID with its media type and optional data payload.
 */
export interface MediaItem<T = Movie | TVShow> {
  /** Discriminates between movie and TV show entries */
  media_type: MediaType
  /** TMDB numeric ID of the media item */
  media_id: number
  /** Full TMDB data object, present after hydration */
  media_data?: T
}
