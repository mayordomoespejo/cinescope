import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNavSearch } from '@/components/ui/navbar/useNavSearch'

// ── Mocks ─────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
const mockSetSearchParams = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: vi.fn(),
}))

import { useSearchParams } from 'react-router-dom'
const mockUseSearchParams = vi.mocked(useSearchParams)

beforeEach(() => {
  const params = new URLSearchParams()
  mockUseSearchParams.mockReturnValue([params, mockSetSearchParams])
  localStorage.clear()
  mockNavigate.mockReset()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('useNavSearch', () => {
  it('initializes with empty query when no q param', () => {
    const { result } = renderHook(() => useNavSearch())
    expect(result.current.query).toBe('')
  })

  it('initializes with q param value', () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams('q=batman'), mockSetSearchParams])
    const { result } = renderHook(() => useNavSearch())
    expect(result.current.query).toBe('batman')
  })

  it('starts with focused=false', () => {
    const { result } = renderHook(() => useNavSearch())
    expect(result.current.focused).toBe(false)
  })

  it('handleChange updates query', () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => {
      result.current.handleChange({
        target: { value: 'inception' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.query).toBe('inception')
  })

  it('handleChange debounces navigation with non-empty query', async () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => {
      result.current.handleChange({
        target: { value: 'batman' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
    act(() => {
      vi.runAllTimers()
    })
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('batman'), expect.any(Object))
  })

  it('handleChange navigates to / when value is empty', () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => {
      result.current.handleChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      vi.runAllTimers()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/', expect.any(Object))
  })

  it('handleSubmit navigates and adds to history', () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => {
      result.current.handleChange({
        target: { value: 'inception' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('inception'))
  })

  it('handleSubmit does not navigate with empty query', () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('handleFocus sets focused=true', () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => {
      result.current.handleFocus()
    })
    expect(result.current.focused).toBe(true)
  })

  it('handleBlur sets focused=false after timeout', async () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => result.current.handleFocus())
    act(() => result.current.handleBlur())
    act(() => vi.runAllTimers())
    expect(result.current.focused).toBe(false)
  })

  it('handleClear resets query and navigates to /', () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => {
      result.current.handleChange({
        target: { value: 'batman' },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleClear()
    })
    expect(result.current.query).toBe('')
    expect(mockNavigate).toHaveBeenCalledWith('/', expect.any(Object))
  })

  it('handleHistoryClick sets query and navigates', () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => result.current.handleFocus())
    act(() => result.current.handleHistoryClick('inception'))
    expect(result.current.query).toBe('inception')
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('inception'))
    expect(result.current.focused).toBe(false)
  })

  it('handleHistoryClear clears history', () => {
    const { result } = renderHook(() => useNavSearch())
    act(() => result.current.handleHistoryClear())
    expect(result.current.history).toEqual([])
  })

  it('syncs query when search params change', () => {
    const { result, rerender } = renderHook(() => useNavSearch())
    mockUseSearchParams.mockReturnValue([
      new URLSearchParams('q=interstellar'),
      mockSetSearchParams,
    ])
    rerender()
    expect(result.current.query).toBe('interstellar')
  })
})
