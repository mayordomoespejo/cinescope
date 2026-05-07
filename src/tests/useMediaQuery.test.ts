import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// ── Mock window.matchMedia ────────────────────────────────────────────

type Listener = (e: MediaQueryListEvent) => void

function mockMatchMedia(matches: boolean) {
  const listeners: Listener[] = []

  const mql = {
    matches,
    addEventListener: vi.fn((event: string, cb: Listener) => {
      if (event === 'change') listeners.push(cb)
    }),
    removeEventListener: vi.fn((event: string, cb: Listener) => {
      const idx = listeners.indexOf(cb)
      if (idx !== -1) listeners.splice(idx, 1)
    }),
    // Helper to simulate a media query change
    _fire: (newMatches: boolean) => {
      listeners.forEach(l => l({ matches: newMatches } as MediaQueryListEvent))
    },
  }

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mql)
  )
  return mql
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMediaQuery', () => {
  it('returns initial match state (true)', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('returns initial match state (false)', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('updates when media query fires a change to true', () => {
    const mql = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    act(() => mql._fire(true))
    expect(result.current).toBe(true)
  })

  it('updates when media query fires a change to false', () => {
    const mql = mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    act(() => mql._fire(false))
    expect(result.current).toBe(false)
  })

  it('removes listener on unmount', () => {
    const mql = mockMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    unmount()
    expect(mql.removeEventListener).toHaveBeenCalled()
  })
})
