import { describe, it, expect, beforeEach } from 'vitest'
import { addSearchQuery, getSearchHistory, clearSearchHistory } from '@/features/search/searchHistoryStore'

beforeEach(() => {
  localStorage.clear()
})

describe('Search history', () => {
  it('adds a search query', () => {
    addSearchQuery('batman')
    expect(getSearchHistory()).toContain('batman')
  })

  it('deduplicates queries', () => {
    addSearchQuery('batman')
    addSearchQuery('batman')
    expect(getSearchHistory()).toHaveLength(1)
  })

  it('clears history', () => {
    addSearchQuery('batman')
    clearSearchHistory()
    expect(getSearchHistory()).toHaveLength(0)
  })

  it('ignores empty strings', () => {
    addSearchQuery('')
    addSearchQuery('   ')
    expect(getSearchHistory()).toHaveLength(0)
  })
})
