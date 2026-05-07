import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWatched } from '@/features/watched/useWatched'
import { useWatchedStore } from '@/features/watched/store'
import type { WatchedItem } from '@/features/watched/store'

const itemMovie: Omit<WatchedItem, 'watched_at'> = {
  media_id: 1,
  media_type: 'movie',
  media_data: {
    id: 1,
    title: 'Movie A',
    overview: '',
    poster_path: null,
    backdrop_path: null,
    release_date: '2024-01-01',
    vote_average: 7,
    vote_count: 100,
    genre_ids: [],
    popularity: 10,
    adult: false,
    original_language: 'en',
    original_title: 'Movie A',
  },
}

const watchedEntry: WatchedItem = {
  ...itemMovie,
  watched_at: '2024-01-01T00:00:00.000Z',
}

beforeEach(() => {
  useWatchedStore.setState({ watchedList: [] })
  localStorage.clear()
})

describe('useWatched', () => {
  describe('initial state', () => {
    it('starts with an empty watched list', () => {
      const { result } = renderHook(() => useWatched())
      expect(result.current.watchedList).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  describe('toggleWatched', () => {
    it('adds an item when it is not watched', () => {
      const { result } = renderHook(() => useWatched())

      act(() => {
        result.current.toggleWatched(itemMovie)
      })

      expect(result.current.isWatched(itemMovie.media_id, itemMovie.media_type)).toBe(true)
      expect(result.current.watchedList[0]).toMatchObject({
        media_id: itemMovie.media_id,
        media_type: itemMovie.media_type,
      })
    })

    it('removes an item when it is already watched', () => {
      useWatchedStore.setState({ watchedList: [watchedEntry] })
      const { result } = renderHook(() => useWatched())

      act(() => {
        result.current.toggleWatched(itemMovie)
      })

      expect(result.current.isWatched(itemMovie.media_id, itemMovie.media_type)).toBe(false)
      expect(result.current.watchedList).toHaveLength(0)
    })

    it('stores the watched_at timestamp when adding', () => {
      const { result } = renderHook(() => useWatched())

      act(() => {
        result.current.toggleWatched(itemMovie)
      })

      expect(result.current.watchedList[0].watched_at).toBeTruthy()
    })
  })

  describe('isWatched', () => {
    it('returns false for an item not in the list', () => {
      const { result } = renderHook(() => useWatched())
      expect(result.current.isWatched(999, 'movie')).toBe(false)
    })

    it('returns true for an item in the list', () => {
      useWatchedStore.setState({ watchedList: [watchedEntry] })
      const { result } = renderHook(() => useWatched())
      expect(result.current.isWatched(watchedEntry.media_id, watchedEntry.media_type)).toBe(true)
    })
  })
})
