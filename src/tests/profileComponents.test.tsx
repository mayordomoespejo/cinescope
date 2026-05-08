/**
 * Tests for profile feature components:
 * ProfileStats, AccountActions, useProfileActions, WatchedSection
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileStats } from '@/features/profile/components/ProfileStats'
import { AccountActions } from '@/features/profile/components/AccountActions'
import { useProfileActions } from '@/features/profile/components/useProfileActions'
import { WatchedSection } from '@/features/watched/components/WatchedSection'
import { renderHook } from '@testing-library/react'
import type { WatchedItem } from '@/features/watched/store'

vi.mock('@/components/ui/Button', () => ({
  default: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/SkeletonCard', () => ({
  SkeletonCardGrid: ({ count }: { count?: number }) => (
    <div data-testid="skeleton-grid" data-count={count} />
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

// ── ProfileStats ──────────────────────────────────────────────────────

describe('ProfileStats', () => {
  it('renders favorites count', () => {
    render(<ProfileStats favoritesCount={5} watchlistCount={3} watchedCount={10} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Favorites')).toBeInTheDocument()
  })

  it('renders watchlist count', () => {
    render(<ProfileStats favoritesCount={0} watchlistCount={7} watchedCount={0} />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Watchlist')).toBeInTheDocument()
  })

  it('renders watched count', () => {
    render(<ProfileStats favoritesCount={0} watchlistCount={0} watchedCount={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Watched')).toBeInTheDocument()
  })

  it('has accessible region label', () => {
    render(<ProfileStats favoritesCount={0} watchlistCount={0} watchedCount={0} />)
    expect(screen.getByRole('region', { name: 'Profile statistics' })).toBeInTheDocument()
  })
})

// ── AccountActions ────────────────────────────────────────────────────

describe('AccountActions', () => {
  it('renders "Clear all local data" button', () => {
    render(<AccountActions isClearing={false} onClearData={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Clear all local data' })).toBeInTheDocument()
  })

  it('does not show modal initially', () => {
    render(<AccountActions isClearing={false} onClearData={vi.fn()} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens modal when clear button clicked', async () => {
    const user = userEvent.setup()
    render(<AccountActions isClearing={false} onClearData={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Clear all local data' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('modal has title "Clear all local data"', async () => {
    const user = userEvent.setup()
    render(<AccountActions isClearing={false} onClearData={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Clear all local data' }))
    const headings = screen.getAllByText('Clear all local data', { selector: 'h2' })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('closes modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<AccountActions isClearing={false} onClearData={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Clear all local data' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('calls onClearData when "Clear data" clicked', async () => {
    const onClearData = vi.fn()
    const user = userEvent.setup()
    render(<AccountActions isClearing={false} onClearData={onClearData} />)
    await user.click(screen.getByRole('button', { name: 'Clear all local data' }))
    await user.click(screen.getByRole('button', { name: 'Clear data' }))
    expect(onClearData).toHaveBeenCalledOnce()
  })

  it('shows "Clearing…" text when isClearing is true', async () => {
    const user = userEvent.setup()
    render(<AccountActions isClearing={true} onClearData={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Clear all local data' }))
    expect(screen.getByText('Clearing…')).toBeInTheDocument()
  })

  it('disables Cancel and Clear buttons when isClearing is true', async () => {
    const user = userEvent.setup()
    render(<AccountActions isClearing={true} onClearData={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Clear all local data' }))
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clearing…' })).toBeDisabled()
  })

  it('closes modal on Escape key', async () => {
    const user = userEvent.setup()
    render(<AccountActions isClearing={false} onClearData={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Clear all local data' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

// ── useProfileActions ─────────────────────────────────────────────────

describe('useProfileActions', () => {
  it('isClearing is always false', () => {
    const { result } = renderHook(() => useProfileActions())
    expect(result.current.isClearing).toBe(false)
  })

  it('handleClearData removes cinescope localStorage keys', () => {
    localStorage.setItem('cinescope-favorites', 'data')
    localStorage.setItem('cinescope-watched', 'data')
    localStorage.setItem('cinescope-lists', 'data')

    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    })

    const { result } = renderHook(() => useProfileActions())
    result.current.handleClearData()

    expect(localStorage.getItem('cinescope-favorites')).toBeNull()
    expect(localStorage.getItem('cinescope-watched')).toBeNull()
    expect(localStorage.getItem('cinescope-lists')).toBeNull()
    expect(reloadMock).toHaveBeenCalledOnce()
  })
})

// ── WatchedSection ────────────────────────────────────────────────────

const makeWatchedItem = (overrides: Partial<WatchedItem> = {}): WatchedItem => ({
  media_id: 1,
  media_type: 'movie',
  watched_at: '2024-01-15T10:00:00.000Z',
  media_data: {
    id: 1,
    title: 'Test Movie',
    poster_path: '/poster.jpg',
    release_date: '2024-01-01',
    vote_average: 7.5,
    overview: '',
    genre_ids: [],
    popularity: 100,
    backdrop_path: null,
    original_title: 'Test Movie',
    original_language: 'en',
    vote_count: 100,
    adult: false,
  },
  ...overrides,
})

describe('WatchedSection', () => {
  it('renders Watch History heading', () => {
    render(<WatchedSection items={[]} onRemove={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Watch History' })).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    render(<WatchedSection items={[]} onRemove={vi.fn()} onNavigate={vi.fn()} />)
    expect(screen.getByText('Nothing watched yet. Start exploring!')).toBeInTheDocument()
  })

  it('renders watched item title', () => {
    const item = makeWatchedItem()
    render(
      <WatchedSection items={[item]} onRemove={vi.fn()} onNavigate={vi.fn()} />
    )
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('calls onNavigate when card is clicked', () => {
    const onNavigate = vi.fn()
    const item = makeWatchedItem()
    const { container } = render(
      <WatchedSection items={[item]} onRemove={vi.fn()} onNavigate={onNavigate} />
    )
    // The card div itself has role=button; the remove button is a <button> child
    const cardDiv = container.querySelector('[role="button"][tabindex="0"]') as HTMLElement
    fireEvent.click(cardDiv)
    expect(onNavigate).toHaveBeenCalledWith('movie', 1)
  })

  it('calls onNavigate on Enter key', () => {
    const onNavigate = vi.fn()
    const item = makeWatchedItem()
    const { container } = render(
      <WatchedSection items={[item]} onRemove={vi.fn()} onNavigate={onNavigate} />
    )
    const cardDiv = container.querySelector('[role="button"][tabindex="0"]') as HTMLElement
    fireEvent.keyDown(cardDiv, { key: 'Enter' })
    expect(onNavigate).toHaveBeenCalledWith('movie', 1)
  })

  it('calls onNavigate on Space key', () => {
    const onNavigate = vi.fn()
    const item = makeWatchedItem()
    const { container } = render(
      <WatchedSection items={[item]} onRemove={vi.fn()} onNavigate={onNavigate} />
    )
    const cardDiv = container.querySelector('[role="button"][tabindex="0"]') as HTMLElement
    fireEvent.keyDown(cardDiv, { key: ' ' })
    expect(onNavigate).toHaveBeenCalledWith('movie', 1)
  })

  it('calls onRemove when remove button clicked', () => {
    const onRemove = vi.fn()
    const item = makeWatchedItem()
    render(
      <WatchedSection items={[item]} onRemove={onRemove} onNavigate={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: /Remove Test Movie/i }))
    expect(onRemove).toHaveBeenCalledWith(item)
  })

  it('remove click does not propagate to card', () => {
    const onNavigate = vi.fn()
    const onRemove = vi.fn()
    const item = makeWatchedItem()
    render(
      <WatchedSection items={[item]} onRemove={onRemove} onNavigate={onNavigate} />
    )
    fireEvent.click(screen.getByRole('button', { name: /Remove Test Movie/i }))
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('handles TV show item (name instead of title)', () => {
    const item = makeWatchedItem({
      media_type: 'tv',
      media_data: {
        id: 2,
        name: 'Breaking Bad',
        poster_path: '/poster.jpg',
        first_air_date: '2008-01-20',
        vote_average: 9.5,
        overview: '',
        genre_ids: [],
        popularity: 200,
        backdrop_path: null,
        original_name: 'Breaking Bad',
        original_language: 'en',
        vote_count: 5000,
      } as unknown as WatchedItem['media_data'],
    })
    render(
      <WatchedSection items={[item]} onRemove={vi.fn()} onNavigate={vi.fn()} />
    )
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument()
  })

  it('handles item with no media_data', () => {
    const item = makeWatchedItem({ media_data: undefined })
    render(
      <WatchedSection items={[item]} onRemove={vi.fn()} onNavigate={vi.fn()} />
    )
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})
