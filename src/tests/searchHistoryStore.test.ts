import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getHistory, addToHistory, clearHistory, removeFromHistory } from '@/features/search/searchHistoryStore'
import { STORAGE_KEYS } from '@/lib/constants'

const KEY = STORAGE_KEYS.SEARCH_HISTORY

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('getHistory', () => {
  it('returns an empty array when localStorage is empty', () => {
    expect(getHistory()).toEqual([])
  })

  it('returns stored queries from localStorage', () => {
    localStorage.setItem(KEY, JSON.stringify(['interstellar', 'inception']))
    expect(getHistory()).toEqual(['interstellar', 'inception'])
  })

  it('returns an empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem(KEY, '{not valid json}')
    expect(getHistory()).toEqual([])
  })

  it('returns an empty array when localStorage value is not a string array', () => {
    localStorage.setItem(KEY, JSON.stringify([1, 2, 3]))
    expect(getHistory()).toEqual([])
  })
})

describe('addToHistory', () => {
  it('adds a query to an empty history', () => {
    addToHistory('batman')
    expect(getHistory()).toContain('batman')
  })

  it('prepends the new query so it appears first', () => {
    addToHistory('inception')
    addToHistory('batman')
    expect(getHistory()[0]).toBe('batman')
  })

  it('deduplicates an existing entry', () => {
    addToHistory('batman')
    addToHistory('inception')
    addToHistory('batman')
    const history = getHistory()
    expect(history.filter(q => q === 'batman')).toHaveLength(1)
    // The re-added entry should now be first
    expect(history[0]).toBe('batman')
  })

  it('ignores empty strings', () => {
    addToHistory('')
    expect(getHistory()).toHaveLength(0)
  })

  it('ignores whitespace-only strings', () => {
    addToHistory('   ')
    expect(getHistory()).toHaveLength(0)
  })

  it('trims the query before saving', () => {
    addToHistory('  batman  ')
    expect(getHistory()).toContain('batman')
    expect(getHistory()).not.toContain('  batman  ')
  })
})

describe('clearHistory', () => {
  it('empties the store', () => {
    addToHistory('batman')
    addToHistory('inception')
    clearHistory()
    expect(getHistory()).toEqual([])
  })

  it('is idempotent when history is already empty', () => {
    clearHistory()
    expect(getHistory()).toEqual([])
  })
})

describe('removeFromHistory', () => {
  it('removes a specific entry', () => {
    addToHistory('batman')
    addToHistory('inception')
    removeFromHistory('batman')
    const history = getHistory()
    expect(history).not.toContain('batman')
    expect(history).toContain('inception')
  })

  it('is a no-op when the entry does not exist', () => {
    addToHistory('inception')
    removeFromHistory('batman')
    expect(getHistory()).toEqual(['inception'])
  })

  it('ignores empty strings', () => {
    addToHistory('batman')
    removeFromHistory('')
    expect(getHistory()).toContain('batman')
  })
})
