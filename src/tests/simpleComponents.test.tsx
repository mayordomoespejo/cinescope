/**
 * Tests for simple presentational components:
 * ErrorAlert, Skeleton, SkeletonCard, SkeletonCardGrid, PageContent
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorAlert from '@/components/ui/ErrorAlert'
import Skeleton from '@/components/ui/Skeleton'
import SkeletonCard, { SkeletonCardGrid } from '@/components/ui/SkeletonCard'
import PageContent from '@/components/ui/PageContent'

// ── ErrorAlert ────────────────────────────────────────────────────────

describe('ErrorAlert', () => {
  it('renders with default message', () => {
    render(<ErrorAlert />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<ErrorAlert message="Network error" />)
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('does not render retry button when onRetry absent', () => {
    render(<ErrorAlert />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders retry button when onRetry provided', () => {
    render(<ErrorAlert onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('calls onRetry when retry button clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorAlert onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('has aria-live=polite', () => {
    render(<ErrorAlert />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite')
  })
})

// ── Skeleton ──────────────────────────────────────────────────────────

describe('Skeleton', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<Skeleton />)
    const el = container.querySelector('[aria-hidden="true"]')
    expect(el).toBeInTheDocument()
  })

  it('applies custom width', () => {
    const { container } = render(<Skeleton width="200px" />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.width).toBe('200px')
  })

  it('applies custom height', () => {
    const { container } = render(<Skeleton height="50px" />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.height).toBe('50px')
  })

  it('applies borderRadius', () => {
    const { container } = render(<Skeleton borderRadius="8px" />)
    const el = container.querySelector('span') as HTMLElement
    expect(el.style.borderRadius).toBe('8px')
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
})

// ── SkeletonCardGrid ──────────────────────────────────────────────────

describe('SkeletonCardGrid', () => {
  it('renders default 6 cards', () => {
    const { container } = render(<SkeletonCardGrid />)
    const wrapper = container.firstChild as HTMLElement
    // Each SkeletonCard is a div child
    expect(wrapper.children).toHaveLength(6)
  })

  it('renders custom count of cards', () => {
    const { container } = render(<SkeletonCardGrid count={3} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.children).toHaveLength(3)
  })

  it('has aria-busy=true and aria-label', () => {
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

// ── PageContent ───────────────────────────────────────────────────────

describe('PageContent', () => {
  it('renders children', () => {
    render(
      <PageContent>
        <span>Hello</span>
      </PageContent>
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('applies additional className', () => {
    const { container } = render(<PageContent className="extra">content</PageContent>)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('extra')
  })

  it('renders without className', () => {
    const { container } = render(<PageContent>content</PageContent>)
    expect(container.firstChild).toBeInTheDocument()
  })
})
