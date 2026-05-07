/**
 * Tests for the MediaGrid shared component.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MediaGrid from '@/components/ui/MediaGrid'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/SkeletonCard', () => ({
  default: ({ key }: { key?: string | number }) => <div aria-hidden="true" data-testid="skeleton-card" key={key} />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MediaGrid', () => {
  it('renders error state when error prop is provided', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={false} error={new Error('Network failure')}>
        <div />
      </MediaGrid>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Network failure')).toBeInTheDocument()
  })

  it('error state has Retry button', () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload },
      writable: true,
    })
    render(
      <MediaGrid isLoading={false} isEmpty={false} error={new Error('oops')}>
        <div />
      </MediaGrid>
    )
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('renders skeleton cards when loading', () => {
    render(
      <MediaGrid isLoading={true} isEmpty={false} skeletonCount={3}>
        <div>child</div>
      </MediaGrid>
    )
    expect(screen.queryByText('child')).toBeNull()
    const skeletons = screen.getAllByTestId('skeleton-card')
    expect(skeletons).toHaveLength(3)
  })

  it('loading state has aria-busy=true', () => {
    const { container } = render(
      <MediaGrid isLoading={true} isEmpty={false} ariaLabel="Movies">
        <div />
      </MediaGrid>
    )
    const grid = container.querySelector('[aria-busy="true"]')
    expect(grid).toBeInTheDocument()
  })

  it('renders empty state when isEmpty is true and not loading', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={true} emptyMessage="No results">
        <div />
      </MediaGrid>
    )
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('renders default empty message when none provided', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={true}>
        <div />
      </MediaGrid>
    )
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders custom emptyIcon', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={true} emptyIcon="📺" emptyMessage="Nothing">
        <div />
      </MediaGrid>
    )
    expect(screen.getByText('📺')).toBeInTheDocument()
  })

  it('renders children when not loading and not empty', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={false}>
        <div>Movie 1</div>
        <div>Movie 2</div>
      </MediaGrid>
    )
    expect(screen.getByText('Movie 1')).toBeInTheDocument()
    expect(screen.getByText('Movie 2')).toBeInTheDocument()
  })

  it('renders grid with ariaLabel as list label', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={false} ariaLabel="Movies">
        <div>item</div>
      </MediaGrid>
    )
    expect(screen.getByRole('list', { name: 'Movies' })).toBeInTheDocument()
  })

  it('renders load more button when hasMore and onLoadMore provided', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={false} hasMore={true} onLoadMore={vi.fn()}>
        <div>item</div>
      </MediaGrid>
    )
    expect(screen.getByRole('button', { name: /discover more/i })).toBeInTheDocument()
  })

  it('does not render load more button when hasMore is false', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={false} hasMore={false} onLoadMore={vi.fn()}>
        <div>item</div>
      </MediaGrid>
    )
    expect(screen.queryByRole('button', { name: /discover more/i })).toBeNull()
  })

  it('calls onLoadMore when load more button clicked', () => {
    const onLoadMore = vi.fn()
    render(
      <MediaGrid isLoading={false} isEmpty={false} hasMore={true} onLoadMore={onLoadMore}>
        <div>item</div>
      </MediaGrid>
    )
    fireEvent.click(screen.getByRole('button', { name: /discover more/i }))
    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it('renders pagination skeletons when isFetchingMore is true', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={false} isFetchingMore={true} fetchingMoreCount={2}>
        <div>item</div>
      </MediaGrid>
    )
    const skeletons = screen.getAllByTestId('skeleton-card')
    expect(skeletons).toHaveLength(2)
  })

  it('does not render load more button when isFetchingMore is true', () => {
    render(
      <MediaGrid isLoading={false} isEmpty={false} hasMore={true} onLoadMore={vi.fn()} isFetchingMore={true}>
        <div>item</div>
      </MediaGrid>
    )
    expect(screen.queryByRole('button', { name: /discover more/i })).toBeNull()
  })

  it('applies custom className to grid', () => {
    const { container } = render(
      <MediaGrid isLoading={false} isEmpty={false} className="custom">
        <div>item</div>
      </MediaGrid>
    )
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
