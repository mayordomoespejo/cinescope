import { describe, it, expect } from 'vitest'
import {
  isObject,
  isFirebaseError,
  isCinescopeList,
  isListItem,
  isWatchedItemArray,
  isWatchedResponse,
  isMoviesResponse,
} from '@/lib/typeGuards'

// ── isObject ──────────────────────────────────────────────────────────

describe('isObject', () => {
  it('returns true for a plain object', () => {
    expect(isObject({ key: 'value' })).toBe(true)
  })

  it('returns true for an empty object', () => {
    expect(isObject({})).toBe(true)
  })

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false)
  })

  it('returns false for a string', () => {
    expect(isObject('hello')).toBe(false)
  })

  it('returns false for a number', () => {
    expect(isObject(42)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isObject(undefined)).toBe(false)
  })
})

// ── isFirebaseError ───────────────────────────────────────────────────

describe('isFirebaseError', () => {
  it('returns true for an Error with a string code property', () => {
    const err = Object.assign(new Error('Firebase error'), { code: 'auth/user-not-found' })
    expect(isFirebaseError(err)).toBe(true)
  })

  it('returns false for a plain Error without code', () => {
    expect(isFirebaseError(new Error('plain error'))).toBe(false)
  })

  it('returns false for an Error with a non-string code', () => {
    const err = Object.assign(new Error('bad code'), { code: 404 })
    expect(isFirebaseError(err)).toBe(false)
  })

  it('returns false for a plain string', () => {
    expect(isFirebaseError('auth/user-not-found')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isFirebaseError(null)).toBe(false)
  })
})

// ── isCinescopeList ───────────────────────────────────────────────────

describe('isCinescopeList', () => {
  const valid = {
    id: 'list-1',
    user_id: 'user-1',
    name: 'My List',
    description: null,
    created_at: '2024-01-01T00:00:00.000Z',
  }

  it('returns true for a valid CinescopeList row', () => {
    expect(isCinescopeList(valid)).toBe(true)
  })

  it('returns false when id is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...row } = valid
    expect(isCinescopeList(row)).toBe(false)
  })

  it('returns false when name is a number', () => {
    expect(isCinescopeList({ ...valid, name: 123 })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isCinescopeList(null)).toBe(false)
  })

  it('returns false for a non-object', () => {
    expect(isCinescopeList('not an object')).toBe(false)
  })
})

// ── isListItem ────────────────────────────────────────────────────────

describe('isListItem', () => {
  const valid = {
    list_id: 'list-1',
    media_id: 42,
    media_type: 'movie',
    media_data: {},
    added_at: '2024-01-01T00:00:00.000Z',
  }

  it('returns true for a valid ListItem row', () => {
    expect(isListItem(valid)).toBe(true)
  })

  it('returns false when media_id is a string', () => {
    expect(isListItem({ ...valid, media_id: '42' })).toBe(false)
  })

  it('returns false when list_id is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { list_id: _list_id, ...row } = valid
    expect(isListItem(row)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isListItem(null)).toBe(false)
  })
})

// ── isWatchedItemArray ────────────────────────────────────────────────

describe('isWatchedItemArray', () => {
  it('returns true for an empty array', () => {
    expect(isWatchedItemArray([])).toBe(true)
  })

  it('returns true for an array with valid WatchedItems', () => {
    const items = [
      {
        media_id: 1,
        media_type: 'movie',
        media_data: {},
        watched_at: '2024-01-01T00:00:00.000Z',
      },
    ]
    expect(isWatchedItemArray(items)).toBe(true)
  })

  it('returns false when first element lacks media_id', () => {
    const items = [{ media_type: 'movie', media_data: {}, watched_at: '' }]
    expect(isWatchedItemArray(items)).toBe(false)
  })

  it('returns false when first element has non-number media_id', () => {
    const items = [{ media_id: 'abc', media_type: 'movie', media_data: {}, watched_at: '' }]
    expect(isWatchedItemArray(items)).toBe(false)
  })

  it('returns false for a non-array value', () => {
    expect(isWatchedItemArray({ media_id: 1 })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isWatchedItemArray(null)).toBe(false)
  })
})

// ── isWatchedResponse ─────────────────────────────────────────────────

describe('isWatchedResponse', () => {
  it('returns true when data has an items array', () => {
    expect(isWatchedResponse({ items: [] })).toBe(true)
  })

  it('returns true when items has elements', () => {
    expect(isWatchedResponse({ items: [{ media_id: 1 }] })).toBe(true)
  })

  it('returns false when items is not an array', () => {
    expect(isWatchedResponse({ items: 'not-an-array' })).toBe(false)
  })

  it('returns false when items key is missing', () => {
    expect(isWatchedResponse({ other: [] })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isWatchedResponse(null)).toBe(false)
  })
})

// ── isMoviesResponse ──────────────────────────────────────────────────

describe('isMoviesResponse', () => {
  it('returns true for any non-null object', () => {
    expect(isMoviesResponse({ movies: [] })).toBe(true)
  })

  it('returns true for an object without movies key', () => {
    // isMoviesResponse only checks isObject — movies is checked downstream
    expect(isMoviesResponse({})).toBe(true)
  })

  it('returns false for null', () => {
    expect(isMoviesResponse(null)).toBe(false)
  })

  it('returns false for a string', () => {
    expect(isMoviesResponse('[]')).toBe(false)
  })

  it('returns false for a number', () => {
    expect(isMoviesResponse(0)).toBe(false)
  })
})
