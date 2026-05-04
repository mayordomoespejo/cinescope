import type { SortOption } from '@/lib/config'

/** Filter state for the Browse page. */
export interface FilterState {
  genre: number | null
  sortBy: SortOption
  page: number
  minRating: number
  year: number | undefined
  language: string
}

/** Sensible defaults — used as initial state in useBrowseFilters. */
export const DEFAULT_FILTER_STATE: FilterState = {
  genre: null,
  sortBy: 'popularity.desc',
  page: 1,
  minRating: 0,
  year: undefined,
  language: '',
}
