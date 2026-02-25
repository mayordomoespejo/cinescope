import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MovieCard from '@/features/movies/components/MovieCard'
import type { Movie } from '@/features/movies/types/movie'

const mockMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  overview: 'A great test movie.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  release_date: '2024-01-15',
  vote_average: 8.2,
  vote_count: 1500,
  genre_ids: [28, 12],
  popularity: 120.5,
  adult: false,
  original_language: 'en',
  original_title: 'Test Movie',
}

describe('MovieCard', () => {
  it('renders the movie title', () => {
    const onOpen = vi.fn()
    render(<MovieCard movie={mockMovie} onOpen={onOpen} />)
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })

  it('renders the release year', () => {
    const onOpen = vi.fn()
    render(<MovieCard movie={mockMovie} onOpen={onOpen} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('renders the rating', () => {
    const onOpen = vi.fn()
    render(<MovieCard movie={mockMovie} onOpen={onOpen} />)
    expect(screen.getByText('8.2')).toBeInTheDocument()
  })

  it('calls onOpen when clicked', () => {
    const onOpen = vi.fn()
    render(<MovieCard movie={mockMovie} onOpen={onOpen} />)
    const card = screen.getByRole('button')
    fireEvent.click(card)
    expect(onOpen).toHaveBeenCalledWith(1)
  })

  it('calls onOpen when Enter is pressed', () => {
    const onOpen = vi.fn()
    render(<MovieCard movie={mockMovie} onOpen={onOpen} />)
    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onOpen).toHaveBeenCalledWith(1)
  })

  it('shows favorite button when onToggleFavorite is provided', () => {
    const onOpen = vi.fn()
    const onToggle = vi.fn()
    render(<MovieCard movie={mockMovie} onOpen={onOpen} onToggleFavorite={onToggle} />)
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument()
  })

  it('shows filled heart when movie is favorite', () => {
    const onOpen = vi.fn()
    const onToggle = vi.fn()
    render(
      <MovieCard movie={mockMovie} onOpen={onOpen} isFavorite={true} onToggleFavorite={onToggle} />
    )
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    const onOpen = vi.fn()
    render(<MovieCard movie={mockMovie} onOpen={onOpen} />)
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Test Movie'))
  })
})
