import type { Video } from '@/features/movies/types/movie'

const YOUTUBE_KEY_RE = /^[a-zA-Z0-9_-]+$/

/**
 * Returns a YouTube embed URL for the given video key.
 * @throws {Error} If the key contains characters outside the allowed set.
 */
export function getYouTubeEmbedUrl(key: string): string {
  if (!YOUTUBE_KEY_RE.test(key)) throw new Error(`Invalid YouTube key: ${key}`)
  return `https://www.youtube.com/embed/${key}?autoplay=1&rel=0&modestbranding=1`
}

/**
 * Selects the best available trailer from a list of TMDB videos.
 *
 * Priority order:
 * 1. Official YouTube `Trailer`.
 * 2. Any YouTube `Trailer` (non-official).
 * 3. Any YouTube `Teaser`.
 *
 * Returns `null` when no suitable video is found.
 *
 * @param videos - Array of TMDB video objects to search through.
 * @returns The highest-priority matching {@link Video}, or `null` if none found.
 */
export function pickTrailer(videos: Video[]): Video | null {
  // Priority: official YouTube trailer
  const official = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official)
  if (official) return official

  // Fallback: any YouTube trailer
  const anyTrailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
  if (anyTrailer) return anyTrailer

  // Fallback: any YouTube teaser
  const teaser = videos.find(v => v.site === 'YouTube' && v.type === 'Teaser')
  return teaser ?? null
}
