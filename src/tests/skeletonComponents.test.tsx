/**
 * Tests for skeleton UI components in /components/ui/skeleton:
 * SkeletonBlock, SkeletonCard, SkeletonGrid
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SkeletonBlock from '@/components/ui/skeleton/SkeletonBlock'
import SkeletonCard from '@/components/ui/skeleton/SkeletonCard'
import SkeletonGrid from '@/components/ui/skeleton/SkeletonGrid'

// ── SkeletonBlock ─────────────────────────────────────────────────────

describe('SkeletonBlock', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<SkeletonBlock />)
    const el = container.querySelector('span')
    expect(el).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies default width and height via CSS vars', () => {
    const { container } = render(<SkeletonBlock />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.getPropertyValue('--skeleton-w')).toBe('100%')
    expect(el.style.getPropertyValue('--skeleton-h')).toBe('1rem')
  })

  it('accepts numeric width and converts to px', () => {
    const { container } = render(<SkeletonBlock width={200} />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.getPropertyValue('--skeleton-w')).toBe('200px')
  })

  it('accepts numeric height and converts to px', () => {
    const { container } = render(<SkeletonBlock height={50} />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.getPropertyValue('--skeleton-h')).toBe('50px')
  })

  it('accepts string width', () => {
    const { container } = render(<SkeletonBlock width="75%" />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.getPropertyValue('--skeleton-w')).toBe('75%')
  })

  it('applies borderRadius as CSS var when provided', () => {
    const { container } = render(<SkeletonBlock borderRadius="8px" />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.getPropertyValue('--skeleton-radius')).toBe('8px')
  })

  it('does not set borderRadius CSS var when not provided', () => {
    const { container } = render(<SkeletonBlock />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.getPropertyValue('--skeleton-radius')).toBe('')
  })

  it('applies additional className', () => {
    const { container } = render(<SkeletonBlock className="extra" />)
    const el = container.querySelector('span')
    expect(el).toHaveClass('extra')
  })
})

// ── SkeletonCard ──────────────────────────────────────────────────────

describe('SkeletonCard (skeleton/)', () => {
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

  it('renders multiple SkeletonBlock children', () => {
    const { container } = render(<SkeletonCard />)
    const spans = container.querySelectorAll('span[aria-hidden="true"]')
    expect(spans.length).toBeGreaterThanOrEqual(1)
  })
})

// ── SkeletonGrid ──────────────────────────────────────────────────────

describe('SkeletonGrid', () => {
  it('renders default 6 cards', () => {
    const { container } = render(<SkeletonGrid />)
    // Each SkeletonCard renders a div with aria-hidden
    const cards = container.querySelectorAll('[aria-hidden="true"]')
    // At least 6 (cards + inner blocks)
    expect(cards.length).toBeGreaterThanOrEqual(6)
  })

  it('renders custom count', () => {
    render(<SkeletonGrid count={3} />)
    const grid = screen.getByLabelText('Loading cards')
    expect(grid.children).toHaveLength(3)
  })

  it('has aria-busy=true', () => {
    render(<SkeletonGrid />)
    const grid = screen.getByLabelText('Loading cards')
    expect(grid).toHaveAttribute('aria-busy', 'true')
  })

  it('applies additional className', () => {
    const { container } = render(<SkeletonGrid className="my-grid" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('my-grid')
  })
})
