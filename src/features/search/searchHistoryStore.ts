import { STORAGE_KEYS } from '@/lib/constants'

const SEARCH_HISTORY_KEY = STORAGE_KEYS.SEARCH_HISTORY
const MAX_HISTORY = 8

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded — data may not be persisted')
    }
  }
}

/**
 * Returns the recent search history from localStorage.
 * Only string entries are returned; malformed data yields an empty array.
 */
export function getHistory(): string[] {
  const result = readStorage<unknown>(SEARCH_HISTORY_KEY, [])
  if (!Array.isArray(result) || !result.every(item => typeof item === 'string')) return []
  return result as string[]
}

/**
 * Adds a search query to the history, deduplicating and capping at MAX_HISTORY entries.
 * Trims whitespace; ignores empty strings.
 */
export function addToHistory(query: string): void {
  const trimmed = query.trim()
  if (!trimmed) return
  const history = getHistory().filter(q => q !== trimmed)
  writeStorage(SEARCH_HISTORY_KEY, [trimmed, ...history].slice(0, MAX_HISTORY))
}

/**
 * Clears all stored search history.
 */
export function clearHistory(): void {
  writeStorage(SEARCH_HISTORY_KEY, [])
}

/**
 * Removes a single entry from the search history.
 * Ignores empty strings and entries that don't exist.
 */
export function removeFromHistory(query: string): void {
  const trimmed = query.trim()
  if (!trimmed) return
  writeStorage(SEARCH_HISTORY_KEY, getHistory().filter(q => q !== trimmed))
}

// ── Legacy aliases (used by useNavSearch and useMovieData) ──────────
/** @deprecated Use addToHistory */
export const addSearchQuery = addToHistory
/** @deprecated Use getHistory */
export const getSearchHistory = getHistory
/** @deprecated Use clearHistory */
export const clearSearchHistory = clearHistory
