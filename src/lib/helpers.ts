import { TMDB_IMAGE_BASE, FALLBACK_POSTER, FALLBACK_BACKDROP, IMAGE_SIZES } from './config'

/** Returns the full TMDB image URL for a poster */
export function getPosterUrl(
  path: string | null,
  size: keyof typeof IMAGE_SIZES.poster = 'md'
): string {
  if (!path) return FALLBACK_POSTER
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.poster[size]}${path}`
}

/** Returns the full TMDB image URL for a person profile photo */
export function getProfileUrl(
  path: string | null,
  size: keyof typeof IMAGE_SIZES.profile = 'md'
): string {
  if (!path) return 'https://placehold.co/185x278/1a1a1a/444?text=No+Photo'
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.profile[size]}${path}`
}

/** Returns the full TMDB image URL for a backdrop */
export function getBackdropUrl(
  path: string | null,
  size: keyof typeof IMAGE_SIZES.backdrop = 'lg'
): string {
  if (!path) return FALLBACK_BACKDROP
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.backdrop[size]}${path}`
}

/** Format a release date to a readable year */
export function getReleaseYear(date: string | null | undefined): string {
  if (!date) return 'N/A'
  return new Date(date).getFullYear().toString()
}

/** Format a full release date (e.g. "Jan 15, 2024") */
export function formatDate(date: string | null | undefined): string {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

/** Format runtime in minutes to "2h 15m" */
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return 'N/A'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Round a vote_average to one decimal */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/** Format large numbers (e.g. revenue) as currency */
export function formatMoney(amount: number): string {
  if (amount === 0) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: amount >= 1_000_000 ? 'compact' : 'standard',
  }).format(amount)
}
