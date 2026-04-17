import { useCallback, useState } from 'react'
import { DEFAULT_FILTER_STATE } from '@/features/filters/types'
import type { FilterState } from '@/features/filters/types'
import type { SortOption } from '@/lib/config'

export interface BrowseFiltersState {
  filters: FilterState
  onGenreSelect: (id: number | null) => void
  onSortChange: (value: SortOption) => void
  onMinRatingChange: (value: number) => void
  onYearChange: (value: number | undefined) => void
  onLanguageChange: (value: string) => void
  onLoadMore: () => void
}

/**
 * Manages filter state (genre, sort, rating, year, language, page) for the
 * Browse page. Every handler resets `page` to 1 except `onLoadMore`.
 */
export function useBrowseFilters(): BrowseFiltersState {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE)

  const onGenreSelect = useCallback((id: number | null) => {
    setFilters(prev => ({ ...prev, genre: id, page: 1 }))
  }, [])

  const onSortChange = useCallback((value: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy: value, page: 1 }))
  }, [])

  const onMinRatingChange = useCallback((value: number) => {
    setFilters(prev => ({ ...prev, minRating: value, page: 1 }))
  }, [])

  const onYearChange = useCallback((value: number | undefined) => {
    setFilters(prev => ({ ...prev, year: value, page: 1 }))
  }, [])

  const onLanguageChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, language: value, page: 1 }))
  }, [])

  const onLoadMore = useCallback(() => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }))
  }, [])

  return {
    filters,
    onGenreSelect,
    onSortChange,
    onMinRatingChange,
    onYearChange,
    onLanguageChange,
    onLoadMore,
  }
}
