/**
 * Tests for MovieCard, TVCard, MovieGrid, and TVGrid components.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MovieCard from '@/features/movies/components/MovieCard'
import TVCard from '@/features/tv/components/TVCard'
import MovieGrid from '@/features/movies/components/MovieGrid'
import TVGrid from '@/features/tv/components/TVGrid'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/ui/SkeletonCard', () => ({
  default: () => <div data-testid="skeleton-card" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// ── Fixtures ──────────────────────────────────────────────────────────

const movie: Movie = {
  id: 1,
  title: 'Inception',
  poster_path: '/inception.jpg',
  backdrop_path: null,
  release_date: '2010-07-16',
  vote_average: 8.8,
  vote_count: 30000,
  overview: 'A thief enters dreams.',
  genre_ids: [28, 878],
  popularity: 150,
  adult: false,
  original_language: 'en',
  original_title: 'Inception',
}

const tvShow: TVShow = {
  id: 10,
  name: 'Breaking Bad',
  poster_path: '/bb.jpg',
  backdrop_path: null,
  first_air_date: '2008-01-20',
  vote_average: 9.5,
  vote_count: 12000,
  overview: 'A chemistry teacher turns drug manufacturer.',
  genre_ids: [18],
  popularity: 300,
  original_language: 'en',
}

// ── MovieCard ─────────────────────────────────────────────────────────

describe('MovieCard', () => {
  it('renders movie title', () => {
    render(<MovieCard movie={movie} onOpen={vi.fn()} />)
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('renders release year', () => {
    render(<MovieCard movie={movie} onOpen={vi.fn()} />)
    expect(screen.getByText('2010')).toBeInTheDocument()
  })

  it('calls onOpen with movie id when clicked', () => {
    const onOpen = vi.fn()
    render(<MovieCard movie={movie} onOpen={onOpen} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onOpen).toHaveBeenCalledWith(1)
  })

  it('calls onPrefetch with movie id on mouse enter', () => {
    const onPrefetch = vi.fn()
    render(<MovieCard movie={movie} onOpen={vi.fn()} onPrefetch={onPrefetch} />)
    fireEvent.mouseEnter(screen.getByRole('button'))
    expect(onPrefetch).toHaveBeenCalledWith(1)
  })

  it('does not throw when no onPrefetch provided', () => {
    render(<MovieCard movie={movie} onOpen={vi.fn()} />)
    expect(() => fireEvent.mouseEnter(screen.getByRole('button'))).not.toThrow()
  })

  it('shows favorite button when onToggleFavorite provided', () => {
    render(<MovieCard movie={movie} onOpen={vi.fn()} onToggleFavorite={vi.fn()} />)
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument()
  })

  it('shows "Remove from favorites" when isFavorite is true', () => {
    render(<MovieCard movie={movie} onOpen={vi.fn()} onToggleFavorite={vi.fn()} isFavorite={true} />)
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument()
  })

  it('calls onToggleFavorite with movie when favorite clicked', () => {
    const onToggleFavorite = vi.fn()
    render(<MovieCard movie={movie} onOpen={vi.fn()} onToggleFavorite={onToggleFavorite} />)
    fireEvent.click(screen.getByLabelText('Add to favorites'))
    expect(onToggleFavorite).toHaveBeenCalledWith(movie)
  })

  it('renders drag handle when provided', () => {
    render(<MovieCard movie={movie} onOpen={vi.fn()} dragHandle={<span>drag</span>} />)
    expect(screen.getByText('drag')).toBeInTheDocument()
  })
})

// ── TVCard ────────────────────────────────────────────────────────────

describe('TVCard', () => {
  it('renders show name', () => {
    render(<TVCard show={tvShow} onOpen={vi.fn()} />)
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument()
  })

  it('renders first air year', () => {
    render(<TVCard show={tvShow} onOpen={vi.fn()} />)
    expect(screen.getByText('2008')).toBeInTheDocument()
  })

  it('calls onOpen with show id when clicked', () => {
    const onOpen = vi.fn()
    render(<TVCard show={tvShow} onOpen={onOpen} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onOpen).toHaveBeenCalledWith(10)
  })

  it('calls onPrefetch with show id on mouse enter', () => {
    const onPrefetch = vi.fn()
    render(<TVCard show={tvShow} onOpen={vi.fn()} onPrefetch={onPrefetch} />)
    fireEvent.mouseEnter(screen.getByRole('button'))
    expect(onPrefetch).toHaveBeenCalledWith(10)
  })

  it('shows favorite button when onToggleFavorite provided', () => {
    render(<TVCard show={tvShow} onOpen={vi.fn()} onToggleFavorite={vi.fn()} />)
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument()
  })

  it('calls onToggleFavorite with show when favorite clicked', () => {
    const onToggleFavorite = vi.fn()
    render(<TVCard show={tvShow} onOpen={vi.fn()} onToggleFavorite={onToggleFavorite} />)
    fireEvent.click(screen.getByLabelText('Add to favorites'))
    expect(onToggleFavorite).toHaveBeenCalledWith(tvShow)
  })
})

// ── MovieGrid ─────────────────────────────────────────────────────────

describe('MovieGrid', () => {
  it('renders skeleton while loading', () => {
    render(
      <MovieGrid movies={[]} isLoading={true} onOpenMovie={vi.fn()} skeletonCount={3} />
    )
    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty message when no movies', () => {
    render(
      <MovieGrid movies={[]} isLoading={false} onOpenMovie={vi.fn()} />
    )
    expect(screen.getByText('No movies found.')).toBeInTheDocument()
  })

  it('shows custom empty message', () => {
    render(
      <MovieGrid movies={[]} isLoading={false} onOpenMovie={vi.fn()} emptyMessage="Nothing here" />
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders movie cards', () => {
    render(
      <MovieGrid movies={[movie]} isLoading={false} onOpenMovie={vi.fn()} />
    )
    expect(screen.getByText('Inception')).toBeInTheDocument()
  })

  it('marks favorite movies correctly', () => {
    render(
      <MovieGrid
        movies={[movie]}
        isLoading={false}
        onOpenMovie={vi.fn()}
        favorites={[1]}
        onToggleFavorite={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(
      <MovieGrid
        movies={[]}
        isLoading={false}
        onOpenMovie={vi.fn()}
        error={new Error('API down')}
      />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

// ── TVGrid ────────────────────────────────────────────────────────────

describe('TVGrid', () => {
  it('shows empty message when no shows', () => {
    render(
      <TVGrid shows={[]} isLoading={false} onOpenShow={vi.fn()} />
    )
    expect(screen.getByText('No TV shows found.')).toBeInTheDocument()
  })

  it('shows custom empty message', () => {
    render(
      <TVGrid shows={[]} isLoading={false} onOpenShow={vi.fn()} emptyMessage="No series" />
    )
    expect(screen.getByText('No series')).toBeInTheDocument()
  })

  it('renders TV show cards', () => {
    render(
      <TVGrid shows={[tvShow]} isLoading={false} onOpenShow={vi.fn()} />
    )
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    render(
      <TVGrid shows={[]} isLoading={true} onOpenShow={vi.fn()} />
    )
    expect(screen.getAllByTestId('skeleton-card').length).toBeGreaterThanOrEqual(1)
  })

  it('marks favorite shows correctly', () => {
    render(
      <TVGrid
        shows={[tvShow]}
        isLoading={false}
        onOpenShow={vi.fn()}
        favorites={[10]}
        onToggleFavorite={vi.fn()}
      />
    )
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(
      <TVGrid
        shows={[]}
        isLoading={false}
        onOpenShow={vi.fn()}
        error={new Error('Failed')}
      />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
