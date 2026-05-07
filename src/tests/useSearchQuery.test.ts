import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSearchQuery } from '@/hooks/useSearchQuery'

// ── Mock react-router-dom ─────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
}))

import { useSearchParams } from 'react-router-dom'

const mockUseSearchParams = vi.mocked(useSearchParams)

describe('useSearchQuery', () => {
  it('returns empty string when q param is absent', () => {
    const params = new URLSearchParams()
    mockUseSearchParams.mockReturnValue([params, vi.fn()])

    const { result } = renderHook(() => useSearchQuery())
    expect(result.current).toBe('')
  })

  it('returns the q param value when present', () => {
    const params = new URLSearchParams('q=batman')
    mockUseSearchParams.mockReturnValue([params, vi.fn()])

    const { result } = renderHook(() => useSearchQuery())
    expect(result.current).toBe('batman')
  })

  it('returns empty string when q param is empty', () => {
    const params = new URLSearchParams('q=')
    mockUseSearchParams.mockReturnValue([params, vi.fn()])

    const { result } = renderHook(() => useSearchQuery())
    expect(result.current).toBe('')
  })

  it('returns the decoded query string', () => {
    const params = new URLSearchParams('q=lord+of+the+rings')
    mockUseSearchParams.mockReturnValue([params, vi.fn()])

    const { result } = renderHook(() => useSearchQuery())
    expect(result.current).toBe('lord of the rings')
  })

  it('returns only q param even when other params exist', () => {
    const params = new URLSearchParams('page=2&q=inception&sort=popular')
    mockUseSearchParams.mockReturnValue([params, vi.fn()])

    const { result } = renderHook(() => useSearchQuery())
    expect(result.current).toBe('inception')
  })
})
