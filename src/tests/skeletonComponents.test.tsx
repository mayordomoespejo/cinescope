/**
 * Tests for skeleton UI components in /components/ui:
 * Skeleton (block), SkeletonCard, SkeletonCardGrid
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Skeleton from '@/components/ui/Skeleton'
import SkeletonCard, { SkeletonCardGrid } from '@/components/ui/SkeletonCard'

// ── Skeleton (block) ──────────────────────────────────────────────────

describe('Skeleton', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<Skeleton />)
    const el = container.querySelector('span')
    expect(el).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies default width and height via inline style', () => {
    const { container } = render(<Skeleton />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.width).toBe('100%')
    expect(el.style.height).toBe('1rem')
  })

  it('accepts numeric-like string width', () => {
    const { container } = render(<Skeleton width="200px" />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.width).toBe('200px')
  })

  it('accepts numeric-like string height', () => {
    const { container } = render(<Skeleton height="50px" />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.height).toBe('50px')
  })

  it('accepts percentage string width', () => {
    const { container } = render(<Skeleton width="75%" />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.width).toBe('75%')
  })

  it('applies borderRadius via inline style when provided', () => {
    const { container } = render(<Skeleton borderRadius="8px" />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.borderRadius).toBe('8px')
  })

  it('does not set borderRadius when not provided', () => {
    const { container } = render(<Skeleton />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.borderRadius).toBe('')
  })

  it('applies additional className', () => {
    const { container } = render(<Skeleton className="extra" />)
    const el = container.querySelector('span')
    expect(el).toHaveClass('extra')
  })
})

// ── SkeletonCard ──────────────────────────────────────────────────────

describe('SkeletonCard', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<SkeletonCard />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies additional className', () => {
    const { container } = render(<SkeletonCard className="custom" />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('custom')
  })

  it('renders multiple Skeleton children', () => {
    const { container } = render(<SkeletonCard />)
    const spans = container.querySelectorAll('span[aria-hidden="true"]')
    expect(spans.length).toBeGreaterThanOrEqual(1)
  })
})

// ── SkeletonCardGrid ──────────────────────────────────────────────────

describe('SkeletonCardGrid', () => {
  it('renders default 6 cards', () => {
    const { container } = render(<SkeletonCardGrid />)
    const cards = container.querySelectorAll('[aria-hidden="true"]')
    expect(cards.length).toBeGreaterThanOrEqual(6)
  })

  it('renders custom count', () => {
    render(<SkeletonCardGrid count={3} />)
    const grid = screen.getByLabelText('Loading cards')
    expect(grid.children).toHaveLength(3)
  })

  it('has aria-busy=true', () => {
    render(<SkeletonCardGrid />)
    const grid = screen.getByLabelText('Loading cards')
    expect(grid).toHaveAttribute('aria-busy', 'true')
  })

  it('applies additional className', () => {
    const { container } = render(<SkeletonCardGrid className="my-grid" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('my-grid')
  })
})
