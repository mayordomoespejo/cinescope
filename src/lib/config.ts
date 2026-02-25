export const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN as string

export const IMAGE_SIZES = {
  poster: {
    sm: 'w185',
    md: 'w342',
    lg: 'w500',
    xl: 'w780',
    original: 'original',
  },
  backdrop: {
    sm: 'w300',
    md: 'w780',
    lg: 'w1280',
    original: 'original',
  },
  profile: {
    sm: 'w45',
    md: 'w185',
    lg: 'h632',
  },
} as const

export const FALLBACK_POSTER = 'https://placehold.co/500x750/1a1a1a/444?text=No+Poster'
export const FALLBACK_BACKDROP = 'https://placehold.co/1280x720/0f0f0f/333?text=No+Image'

export const DEFAULT_PAGE_SIZE = 20
export const DEBOUNCE_DELAY = 400
export const STALE_TIME_SHORT = 1000 * 60 * 5 // 5 min
export const STALE_TIME_LONG = 1000 * 60 * 60 // 1 hour

export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest First' },
  { value: 'primary_release_date.asc', label: 'Oldest First' },
  { value: 'revenue.desc', label: 'Highest Revenue' },
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]['value']
