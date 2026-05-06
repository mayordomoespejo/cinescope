/**
 * Tests for simple page components:
 * NotFound, WelcomePage, Home, TVBrowsePage, WatchedPage, ProfilePage
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// ── Mocks ─────────────────────────────────────────────────────────────

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/components/ui/Button', () => ({
  default: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}))

// Mocks for Favorites page deps
vi.mock('@/components/ui/LayoutContext', () => ({
  useOutletContext: () => ({ onOpenMovie: vi.fn() }),
}))

vi.mock('@/features/favorites/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    watchlist: [],
    isLoading: false,
    toggleFavorite: vi.fn(),
    reorderFavorites: vi.fn(),
    reorderWatchlist: vi.fn(),
  }),
}))

vi.mock('@/features/movies/hooks/useMoviePrefetch', () => ({
  useMoviePrefetch: () => ({ prefetchMovieData: vi.fn() }),
}))

vi.mock('@/features/movies/components/SortableMovieGrid', () => ({
  default: ({ emptyMessage }: { emptyMessage?: string }) => <div>{emptyMessage}</div>,
}))

vi.mock('@/components/ui/SkeletonCard', () => ({
  SkeletonCardGrid: () => <div aria-label="Loading cards" />,
}))

vi.mock('@/components/ui/PageContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mocks for WatchedPage
vi.mock('@/features/watched/useWatched', () => ({
  useWatched: () => ({
    watchedList: [],
    loading: false,
    toggleWatched: vi.fn(),
  }),
}))

vi.mock('@/features/watched/components/WatchedSection', () => ({
  WatchedSection: ({ items, loading }: { items: unknown[]; loading: boolean }) => (
    <div>
      {loading ? 'Loading...' : `${items.length} items`}
    </div>
  ),
}))

// Mocks for ProfilePage
vi.mock('@/features/profile/components/ProfileStats', () => ({
  ProfileStats: ({ favoritesCount }: { favoritesCount: number }) => (
    <div>Favorites: {favoritesCount}</div>
  ),
}))

vi.mock('@/features/profile/components/AccountActions', () => ({
  AccountActions: () => <div>AccountActions</div>,
}))

vi.mock('@/features/profile/components/useProfileActions', () => ({
  useProfileActions: () => ({ isClearing: false, handleClearData: vi.fn() }),
}))

// Mocks for BrowsePage (for Home)
vi.mock('./BrowsePage', () => ({
  default: () => <div>BrowsePage</div>,
}), { virtual: true })

// ── NotFound ──────────────────────────────────────────────────────────

describe('NotFound', () => {
  it('renders 404 heading', async () => {
    const { default: NotFound } = await import('@/pages/NotFound')
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders "Scene not found" subtitle', async () => {
    const { default: NotFound } = await import('@/pages/NotFound')
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    expect(screen.getByText('Scene not found')).toBeInTheDocument()
  })

  it('renders Back to Home link', async () => {
    const { default: NotFound } = await import('@/pages/NotFound')
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )
    expect(screen.getByText('Back to Home')).toBeInTheDocument()
  })
})

// ── WelcomePage ───────────────────────────────────────────────────────

describe('WelcomePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders CINESCOPE logo', async () => {
    const { default: WelcomePage } = await import('@/pages/WelcomePage')
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    )
    expect(screen.getByText('CINE')).toBeInTheDocument()
    expect(screen.getByText('SCOPE')).toBeInTheDocument()
  })

  it('renders tagline', async () => {
    const { default: WelcomePage } = await import('@/pages/WelcomePage')
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Discover. Save. Watch.')).toBeInTheDocument()
  })

  it('renders Entrar button', async () => {
    const { default: WelcomePage } = await import('@/pages/WelcomePage')
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('navigates to / when Entrar is clicked', async () => {
    const { default: WelcomePage } = await import('@/pages/WelcomePage')
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})

// ── WatchedPage ───────────────────────────────────────────────────────

describe('WatchedPage', () => {
  it('renders without crashing', async () => {
    const { default: WatchedPage } = await import('@/pages/WatchedPage')
    render(
      <MemoryRouter>
        <WatchedPage />
      </MemoryRouter>
    )
    expect(screen.getByText('0 items')).toBeInTheDocument()
  })
})

// ── Favorites page ────────────────────────────────────────────────────

describe('Favorites page', () => {
  it('renders My Favorites heading', async () => {
    const { default: Favorites } = await import('@/pages/Favorites')
    render(
      <MemoryRouter>
        <Favorites />
      </MemoryRouter>
    )
    expect(screen.getByText('My Favorites')).toBeInTheDocument()
  })

  it('shows empty message when no favorites', async () => {
    const { default: Favorites } = await import('@/pages/Favorites')
    render(
      <MemoryRouter>
        <Favorites />
      </MemoryRouter>
    )
    expect(screen.getByText("No favorites yet — save movies you love!")).toBeInTheDocument()
  })
})

// ── ProfilePage ───────────────────────────────────────────────────────

describe('ProfilePage', () => {
  it('renders without crashing', async () => {
    const { default: ProfilePage } = await import('@/pages/ProfilePage')
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    )
    expect(screen.getByText('Favorites: 0')).toBeInTheDocument()
  })
})
