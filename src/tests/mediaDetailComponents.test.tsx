/**
 * Tests for media-detail sub-components and MediaDetailLayout.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MediaDetailCast from '@/components/ui/media-detail/MediaDetailCast'
import MediaDetailHero from '@/components/ui/media-detail/MediaDetailHero'
import MediaDetailTrailer from '@/components/ui/media-detail/MediaDetailTrailer'
import MediaDetailRecommendations from '@/components/ui/media-detail/MediaDetailRecommendations'
import MediaDetailPoster from '@/components/ui/media-detail/MediaDetailPoster'
import MediaDetailInfo from '@/components/ui/media-detail/MediaDetailInfo'
import MediaDetailLayout from '@/components/ui/MediaDetailLayout'
import type { CastMember } from '@/features/movies/types/movie'
import type { MediaDetailData } from '@/components/ui/MediaDetailLayout'

vi.mock('@/components/ui/Button', () => ({
  default: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => <button onClick={onClick}>{children}</button>,
}))

vi.mock('@/components/ui/Skeleton', () => ({
  default: () => <div data-testid="skeleton" />,
}))

vi.mock('@/components/ui/IconButton', () => ({
  default: ({
    children,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    onClick?: () => void
    'aria-label'?: string
  }) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Silence Radix tooltip portal warnings
vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Trigger: ({ children }: { children: React.ReactNode; asChild?: boolean }) => <>{children}</>,
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Content: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// ── MediaDetailCast ────────────────────────────────────────────────────

const castMembers: CastMember[] = [
  {
    id: 1,
    name: 'Tom Hanks',
    character: 'Forrest Gump',
    profile_path: '/hanks.jpg',
    order: 0,
    known_for_department: 'Acting',
  },
  {
    id: 2,
    name: 'Robin Wright',
    character: 'Jenny',
    profile_path: null,
    order: 1,
    known_for_department: 'Acting',
  },
]

describe('MediaDetailCast', () => {
  it('renders nothing when cast is empty', () => {
    const { container } = render(
      <MemoryRouter>
        <MediaDetailCast cast={[]} idPrefix="movie" />
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders Cast heading', () => {
    render(
      <MemoryRouter>
        <MediaDetailCast cast={castMembers} idPrefix="movie" />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Cast' })).toBeInTheDocument()
  })

  it('renders each cast member name', () => {
    render(
      <MemoryRouter>
        <MediaDetailCast cast={castMembers} idPrefix="movie" />
      </MemoryRouter>
    )
    expect(screen.getByText('Tom Hanks')).toBeInTheDocument()
    expect(screen.getByText('Robin Wright')).toBeInTheDocument()
  })

  it('renders character names', () => {
    render(
      <MemoryRouter>
        <MediaDetailCast cast={castMembers} idPrefix="movie" />
      </MemoryRouter>
    )
    expect(screen.getByText('Forrest Gump')).toBeInTheDocument()
    expect(screen.getByText('Jenny')).toBeInTheDocument()
  })

  it('links to /person/:id', () => {
    render(
      <MemoryRouter>
        <MediaDetailCast cast={castMembers} idPrefix="movie" />
      </MemoryRouter>
    )
    const links = screen.getAllByRole('listitem')
    expect(links[0]).toHaveAttribute('href', '/person/1')
  })
})

// ── MediaDetailHero ────────────────────────────────────────────────────

describe('MediaDetailHero', () => {
  it('renders skeleton when loading', () => {
    render(<MediaDetailHero isLoading={true} backdropPath={null} posterPath={null} />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('renders backdrop image when available', () => {
    render(
      <MediaDetailHero isLoading={false} backdropPath="/backdrop.jpg" posterPath={null} />
    )
    const img = screen.getByRole('presentation', { hidden: true })
    expect(img).toBeInTheDocument()
  })

  it('renders poster as fallback when no backdrop', () => {
    render(
      <MediaDetailHero isLoading={false} backdropPath={null} posterPath="/poster.jpg" />
    )
    const img = document.querySelector('img')
    expect(img).toBeInTheDocument()
  })

  it('renders nothing (no img) when both paths are null', () => {
    render(
      <MediaDetailHero isLoading={false} backdropPath={null} posterPath={null} />
    )
    expect(document.querySelector('img')).toBeNull()
  })
})

// ── MediaDetailTrailer ─────────────────────────────────────────────────

describe('MediaDetailTrailer', () => {
  it('renders Trailer heading', () => {
    render(
      <MediaDetailTrailer trailerKey="abc123" title="Inception" idPrefix="movie" />
    )
    expect(screen.getByRole('heading', { name: 'Trailer' })).toBeInTheDocument()
  })

  it('renders iframe with correct title', () => {
    render(
      <MediaDetailTrailer trailerKey="abc123" title="Inception" idPrefix="movie" />
    )
    expect(screen.getByTitle('Inception — Official Trailer')).toBeInTheDocument()
  })

  it('renders iframe with fallback title when no title provided', () => {
    render(
      <MediaDetailTrailer trailerKey="abc123" title={undefined} idPrefix="movie" />
    )
    expect(screen.getByTitle('Trailer')).toBeInTheDocument()
  })
})

// ── MediaDetailRecommendations ─────────────────────────────────────────

describe('MediaDetailRecommendations', () => {
  it('renders "You May Also Like" heading', () => {
    render(
      <MediaDetailRecommendations
        recommendations={<div>Some recommendations</div>}
        idPrefix="movie"
      />
    )
    expect(screen.getByRole('heading', { name: 'You May Also Like' })).toBeInTheDocument()
  })

  it('renders passed recommendations', () => {
    render(
      <MediaDetailRecommendations
        recommendations={<div>Rec content</div>}
        idPrefix="movie"
      />
    )
    expect(screen.getByText('Rec content')).toBeInTheDocument()
  })

  it('uses idPrefix in heading id', () => {
    render(
      <MediaDetailRecommendations
        recommendations={<div />}
        idPrefix="tv"
      />
    )
    expect(document.getElementById('tv-recommendations-heading')).toBeInTheDocument()
  })
})

// ── MediaDetailPoster ──────────────────────────────────────────────────

describe('MediaDetailPoster', () => {
  const defaultProps = {
    isLoading: false,
    posterPath: '/poster.jpg',
    title: 'Test Movie',
    isFavorite: false,
    isInWatchlist: false,
    isWatched: false,
    onToggleFavorite: vi.fn(),
    onToggleWatchlist: vi.fn(),
    onToggleWatched: vi.fn(),
    showActions: true,
  }

  it('renders skeleton when loading', () => {
    render(<MediaDetailPoster {...defaultProps} isLoading={true} />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('renders poster image when not loading', () => {
    render(<MediaDetailPoster {...defaultProps} />)
    expect(screen.getByAltText('Test Movie poster')).toBeInTheDocument()
  })

  it('does not render actions when showActions is false', () => {
    render(<MediaDetailPoster {...defaultProps} showActions={false} />)
    expect(screen.queryByLabelText('Add to favorites')).toBeNull()
  })

  it('renders action buttons when showActions is true', () => {
    render(<MediaDetailPoster {...defaultProps} />)
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument()
    expect(screen.getByLabelText('Add to watchlist')).toBeInTheDocument()
    expect(screen.getByLabelText('Mark as watched')).toBeInTheDocument()
  })

  it('shows "Remove from favorites" when isFavorite', () => {
    render(<MediaDetailPoster {...defaultProps} isFavorite={true} />)
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument()
  })

  it('shows "Remove from watchlist" when isInWatchlist', () => {
    render(<MediaDetailPoster {...defaultProps} isInWatchlist={true} />)
    expect(screen.getByLabelText('Remove from watchlist')).toBeInTheDocument()
  })

  it('shows "Mark as unwatched" when isWatched', () => {
    render(<MediaDetailPoster {...defaultProps} isWatched={true} />)
    expect(screen.getByLabelText('Mark as unwatched')).toBeInTheDocument()
  })

  it('calls onToggleFavorite when favorite button clicked', () => {
    const onToggleFavorite = vi.fn()
    render(<MediaDetailPoster {...defaultProps} onToggleFavorite={onToggleFavorite} />)
    fireEvent.click(screen.getByLabelText('Add to favorites'))
    expect(onToggleFavorite).toHaveBeenCalledOnce()
  })
})

// ── MediaDetailInfo ────────────────────────────────────────────────────

describe('MediaDetailInfo', () => {
  it('renders skeleton when loading', () => {
    render(
      <MediaDetailInfo isLoading={true} mediaType="movie" />
    )
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('returns null when not loading and no title', () => {
    const { container } = render(
      <MediaDetailInfo isLoading={false} mediaType="movie" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders movie title', () => {
    render(
      <MediaDetailInfo isLoading={false} mediaType="movie" title="Inception" />
    )
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('renders tagline in quotes', () => {
    render(
      <MediaDetailInfo isLoading={false} mediaType="movie" title="Movie" tagline="Your mind is the scene" />
    )
    expect(screen.getByText('"Your mind is the scene"')).toBeInTheDocument()
  })

  it('does not render tagline when not provided', () => {
    render(
      <MediaDetailInfo isLoading={false} mediaType="movie" title="Movie" />
    )
    expect(document.querySelector('p')).toBeNull()
  })

  it('renders overview', () => {
    render(
      <MediaDetailInfo isLoading={false} mediaType="movie" title="Movie" overview="A great film." />
    )
    expect(screen.getByText('A great film.')).toBeInTheDocument()
  })

  it('renders rating badge', () => {
    render(
      <MediaDetailInfo isLoading={false} mediaType="movie" title="Movie" voteAverage={8.5} />
    )
    expect(screen.getByLabelText(/Rating: 8.5/i)).toBeInTheDocument()
  })

  it('renders genres', () => {
    render(
      <MediaDetailInfo
        isLoading={false}
        mediaType="movie"
        title="Movie"
        genres={[{ id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }]}
      />
    )
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Adventure')).toBeInTheDocument()
  })

  it('renders movie runtime', () => {
    render(
      <MediaDetailInfo
        isLoading={false}
        mediaType="movie"
        title="Movie"
        movieExtras={{ runtime: 148 }}
      />
    )
    expect(screen.getByText('2h 28m')).toBeInTheDocument()
  })

  it('renders TV status badge', () => {
    render(
      <MediaDetailInfo
        isLoading={false}
        mediaType="tv"
        title="Show"
        tvExtras={{ status: 'Returning Series' }}
      />
    )
    expect(screen.getByText('Returning Series')).toBeInTheDocument()
  })

  it('renders TV seasons and episodes', () => {
    render(
      <MediaDetailInfo
        isLoading={false}
        mediaType="tv"
        title="Show"
        tvExtras={{ numberOfSeasons: 5, numberOfEpisodes: 62 }}
      />
    )
    expect(screen.getByText('5 Seasons')).toBeInTheDocument()
    expect(screen.getByText('62 Episodes')).toBeInTheDocument()
  })

  it('renders singular season', () => {
    render(
      <MediaDetailInfo
        isLoading={false}
        mediaType="tv"
        title="Show"
        tvExtras={{ numberOfSeasons: 1 }}
      />
    )
    expect(screen.getByText('1 Season')).toBeInTheDocument()
  })

  it('renders movie budget and revenue', () => {
    render(
      <MediaDetailInfo
        isLoading={false}
        mediaType="movie"
        title="Movie"
        movieExtras={{ budget: 50000000, revenue: 200000000 }}
      />
    )
    expect(screen.getByText('Budget')).toBeInTheDocument()
    expect(screen.getByText('Revenue')).toBeInTheDocument()
  })

  it('statusClass: Ended maps to gray', () => {
    render(
      <MediaDetailInfo
        isLoading={false}
        mediaType="tv"
        title="Show"
        tvExtras={{ status: 'Ended' }}
      />
    )
    expect(screen.getByText('Ended')).toBeInTheDocument()
  })

  it('statusClass: Canceled maps to red', () => {
    render(
      <MediaDetailInfo
        isLoading={false}
        mediaType="tv"
        title="Show"
        tvExtras={{ status: 'Canceled' }}
      />
    )
    expect(screen.getByText('Canceled')).toBeInTheDocument()
  })

  it('statusClass: unknown status maps to gray', () => {
    render(
      <MediaDetailInfo
        isLoading={false}
        mediaType="tv"
        title="Show"
        tvExtras={{ status: 'Pilot' }}
      />
    )
    expect(screen.getByText('Pilot')).toBeInTheDocument()
  })
})

// ── MediaDetailLayout ──────────────────────────────────────────────────

const defaultData: MediaDetailData = {
  id: 1,
  title: 'Inception',
  overview: 'A mind-bending thriller.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  releaseDate: '2010-07-16',
  vote_average: 8.8,
  genres: [{ id: 878, name: 'Science Fiction' }],
  cast: castMembers,
  trailerKey: 'abc123',
}

const defaultLayoutProps = {
  mediaType: 'movie' as const,
  data: defaultData,
  isLoading: false,
  error: null,
  isFavorite: false,
  isInWatchlist: false,
  isWatched: false,
  onToggleFavorite: vi.fn(),
  onToggleWatchlist: vi.fn(),
  onToggleWatched: vi.fn(),
}

describe('MediaDetailLayout', () => {
  it('renders error state when error is provided', () => {
    render(
      <MemoryRouter>
        <MediaDetailLayout
          {...defaultLayoutProps}
          data={null}
          error={new Error('Not found')}
        />
      </MemoryRouter>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Failed to load movie details')).toBeInTheDocument()
  })

  it('error state for TV shows has correct message', () => {
    render(
      <MemoryRouter>
        <MediaDetailLayout
          {...defaultLayoutProps}
          mediaType="tv"
          data={null}
          error={new Error('Not found')}
        />
      </MemoryRouter>
    )
    expect(screen.getByText('Failed to load TV show details')).toBeInTheDocument()
  })

  it('Go back navigates on click', () => {
    render(
      <MemoryRouter>
        <MediaDetailLayout
          {...defaultLayoutProps}
          data={null}
          error={new Error('oops')}
        />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('renders title when data provided', () => {
    render(
      <MemoryRouter>
        <MediaDetailLayout {...defaultLayoutProps} />
      </MemoryRouter>
    )
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('renders cast section', () => {
    render(
      <MemoryRouter>
        <MediaDetailLayout {...defaultLayoutProps} />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Cast' })).toBeInTheDocument()
  })

  it('renders trailer when trailerKey present', () => {
    render(
      <MemoryRouter>
        <MediaDetailLayout {...defaultLayoutProps} />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Trailer' })).toBeInTheDocument()
  })

  it('does not render trailer when trailerKey absent', () => {
    const dataNoTrailer = { ...defaultData, trailerKey: null }
    render(
      <MemoryRouter>
        <MediaDetailLayout {...defaultLayoutProps} data={dataNoTrailer} />
      </MemoryRouter>
    )
    expect(screen.queryByRole('heading', { name: 'Trailer' })).toBeNull()
  })

  it('renders recommendations section when passed', () => {
    render(
      <MemoryRouter>
        <MediaDetailLayout
          {...defaultLayoutProps}
          recommendations={<div>Similar movies</div>}
        />
      </MemoryRouter>
    )
    expect(screen.getByText('Similar movies')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'You May Also Like' })).toBeInTheDocument()
  })

  it('does not render recommendations when not passed', () => {
    render(
      <MemoryRouter>
        <MediaDetailLayout {...defaultLayoutProps} />
      </MemoryRouter>
    )
    expect(screen.queryByRole('heading', { name: 'You May Also Like' })).toBeNull()
  })
})
