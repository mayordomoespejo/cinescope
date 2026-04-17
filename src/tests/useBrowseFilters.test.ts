import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBrowseFilters } from '@/hooks/browse/useBrowseFilters'
import { DEFAULT_FILTER_STATE } from '@/features/filters/types'

// ── Tests ─────────────────────────────────────────────────────────────

describe('useBrowseFilters', () => {
  describe('initial state', () => {
    it('has correct defaults matching DEFAULT_FILTER_STATE', () => {
      const { result } = renderHook(() => useBrowseFilters())

      expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE)
      expect(result.current.filters.genre).toBeNull()
      expect(result.current.filters.sortBy).toBe('popularity.desc')
      expect(result.current.filters.page).toBe(1)
      expect(result.current.filters.minRating).toBe(0)
      expect(result.current.filters.year).toBeUndefined()
      expect(result.current.filters.language).toBe('')
    })
  })

  describe('onGenreSelect', () => {
    it('updates genre and resets page to 1', () => {
      const { result } = renderHook(() => useBrowseFilters())

      // Advance page first so we can verify reset
      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(2)

      act(() => { result.current.onGenreSelect(28) })

      expect(result.current.filters.genre).toBe(28)
      expect(result.current.filters.page).toBe(1)
    })

    it('accepts null to clear the genre filter', () => {
      const { result } = renderHook(() => useBrowseFilters())

      act(() => { result.current.onGenreSelect(28) })
      act(() => { result.current.onGenreSelect(null) })

      expect(result.current.filters.genre).toBeNull()
    })
  })

  describe('onSortChange', () => {
    it('updates sortBy and resets page to 1', () => {
      const { result } = renderHook(() => useBrowseFilters())

      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(2)

      act(() => { result.current.onSortChange('vote_average.desc') })

      expect(result.current.filters.sortBy).toBe('vote_average.desc')
      expect(result.current.filters.page).toBe(1)
    })
  })

  describe('onMinRatingChange', () => {
    it('updates minRating and resets page to 1', () => {
      const { result } = renderHook(() => useBrowseFilters())

      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(2)

      act(() => { result.current.onMinRatingChange(7) })

      expect(result.current.filters.minRating).toBe(7)
      expect(result.current.filters.page).toBe(1)
    })
  })

  describe('onYearChange', () => {
    it('updates year and resets page to 1', () => {
      const { result } = renderHook(() => useBrowseFilters())

      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(2)

      act(() => { result.current.onYearChange(2020) })

      expect(result.current.filters.year).toBe(2020)
      expect(result.current.filters.page).toBe(1)
    })

    it('accepts undefined to clear the year filter', () => {
      const { result } = renderHook(() => useBrowseFilters())

      act(() => { result.current.onYearChange(2020) })
      act(() => { result.current.onYearChange(undefined) })

      expect(result.current.filters.year).toBeUndefined()
    })
  })

  describe('onLoadMore', () => {
    it('increments page by 1 each call', () => {
      const { result } = renderHook(() => useBrowseFilters())

      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(2)

      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(3)
    })

    it('does not reset other filter values', () => {
      const { result } = renderHook(() => useBrowseFilters())

      act(() => { result.current.onGenreSelect(18) })
      act(() => { result.current.onSortChange('vote_average.desc') })
      act(() => { result.current.onLoadMore() })

      expect(result.current.filters.genre).toBe(18)
      expect(result.current.filters.sortBy).toBe('vote_average.desc')
      expect(result.current.filters.page).toBe(2)
    })
  })

  describe('page reset on filter change', () => {
    it('onGenreSelect resets page to 1', () => {
      const { result } = renderHook(() => useBrowseFilters())
      act(() => { result.current.onLoadMore() })
      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(3)

      act(() => { result.current.onGenreSelect(12) })
      expect(result.current.filters.page).toBe(1)
    })

    it('onSortChange resets page to 1', () => {
      const { result } = renderHook(() => useBrowseFilters())
      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(2)

      act(() => { result.current.onSortChange('primary_release_date.desc') })
      expect(result.current.filters.page).toBe(1)
    })

    it('onMinRatingChange resets page to 1', () => {
      const { result } = renderHook(() => useBrowseFilters())
      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(2)

      act(() => { result.current.onMinRatingChange(8) })
      expect(result.current.filters.page).toBe(1)
    })

    it('onYearChange resets page to 1', () => {
      const { result } = renderHook(() => useBrowseFilters())
      act(() => { result.current.onLoadMore() })
      expect(result.current.filters.page).toBe(2)

      act(() => { result.current.onYearChange(2019) })
      expect(result.current.filters.page).toBe(1)
    })
  })
})
