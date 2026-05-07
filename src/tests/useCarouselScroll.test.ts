import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCarouselScroll } from '@/hooks/useCarouselScroll'

describe('useCarouselScroll', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useCarouselScroll())
    expect(result.current.canScrollLeft).toBe(false)
    expect(result.current.canScrollRight).toBe(true)
    expect(typeof result.current.scroll).toBe('function')
    expect(typeof result.current.updateBounds).toBe('function')
    expect(result.current.trackRef).toBeDefined()
  })

  it('updateBounds does nothing when trackRef is null', () => {
    const { result } = renderHook(() => useCarouselScroll())
    // trackRef.current is null by default (not attached to DOM)
    act(() => {
      result.current.updateBounds()
    })
    // Should not throw; state unchanged
    expect(result.current.canScrollLeft).toBe(false)
    expect(result.current.canScrollRight).toBe(true)
  })

  it('scroll does nothing when trackRef is null', () => {
    const { result } = renderHook(() => useCarouselScroll())
    const before = { left: result.current.canScrollLeft, right: result.current.canScrollRight }
    act(() => {
      result.current.scroll('right')
      result.current.scroll('left')
    })
    expect(result.current.canScrollLeft).toBe(before.left)
    expect(result.current.canScrollRight).toBe(before.right)
  })

  it('updateBounds sets canScrollLeft based on scrollLeft', () => {
    const { result } = renderHook(() => useCarouselScroll())

    // Attach a mock element to the ref
    const mockEl = {
      scrollLeft: 100,
      clientWidth: 300,
      scrollWidth: 500,
      scrollBy: () => {},
    } as unknown as HTMLDivElement

    Object.defineProperty(result.current.trackRef, 'current', {
      get: () => mockEl,
      configurable: true,
    })

    act(() => {
      result.current.updateBounds()
    })

    expect(result.current.canScrollLeft).toBe(true)
    expect(result.current.canScrollRight).toBe(true)
  })

  it('updateBounds sets canScrollRight=false at end of scroll', () => {
    const { result } = renderHook(() => useCarouselScroll())

    const mockEl = {
      scrollLeft: 200,
      clientWidth: 300,
      scrollWidth: 500, // 200 + 300 = 500 = scrollWidth → at end
      scrollBy: () => {},
    } as unknown as HTMLDivElement

    Object.defineProperty(result.current.trackRef, 'current', {
      get: () => mockEl,
      configurable: true,
    })

    act(() => {
      result.current.updateBounds()
    })

    expect(result.current.canScrollRight).toBe(false)
  })

  it('scroll calls scrollBy on the element', () => {
    const { result } = renderHook(() => useCarouselScroll())

    const scrollBy = vi.fn()
    const mockEl = {
      scrollLeft: 0,
      clientWidth: 400,
      scrollWidth: 1200,
      scrollBy,
    } as unknown as HTMLDivElement

    Object.defineProperty(result.current.trackRef, 'current', {
      get: () => mockEl,
      configurable: true,
    })

    act(() => {
      result.current.scroll('right')
    })

    expect(scrollBy).toHaveBeenCalledWith({ left: 300, behavior: 'smooth' })
  })

  it('scroll calls scrollBy with negative amount for left', () => {
    const { result } = renderHook(() => useCarouselScroll())

    const scrollBy = vi.fn()
    const mockEl = {
      scrollLeft: 300,
      clientWidth: 400,
      scrollWidth: 1200,
      scrollBy,
    } as unknown as HTMLDivElement

    Object.defineProperty(result.current.trackRef, 'current', {
      get: () => mockEl,
      configurable: true,
    })

    act(() => {
      result.current.scroll('left')
    })

    expect(scrollBy).toHaveBeenCalledWith({ left: -300, behavior: 'smooth' })
  })
})
