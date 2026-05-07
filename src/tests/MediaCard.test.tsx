import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MediaCard from '@/components/ui/MediaCard'

const defaultProps = {
  title: 'Interstellar',
  year: '2014',
  posterPath: '/poster.jpg',
  rating: 8.6,
  isFavorite: false,
  onClick: vi.fn(),
}

describe('MediaCard', () => {
  it('renders title and year', () => {
    render(<MediaCard {...defaultProps} />)
    expect(screen.getByText('Interstellar')).toBeInTheDocument()
    expect(screen.getByText('2014')).toBeInTheDocument()
  })

  it('renders rating badge when rating is provided', () => {
    render(<MediaCard {...defaultProps} />)
    expect(screen.getByLabelText(/Rating: 8.6/i)).toBeInTheDocument()
  })

  it('does not render rating badge when rating is undefined', () => {
    render(<MediaCard {...defaultProps} rating={undefined} />)
    expect(screen.queryByLabelText(/Rating:/i)).toBeNull()
  })

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn()
    render(<MediaCard {...defaultProps} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('calls onClick on Enter key', () => {
    const onClick = vi.fn()
    render(<MediaCard {...defaultProps} onClick={onClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('calls onClick on Space key', () => {
    const onClick = vi.fn()
    render(<MediaCard {...defaultProps} onClick={onClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick on other keys', () => {
    const onClick = vi.fn()
    render(<MediaCard {...defaultProps} onClick={onClick} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders favorite button when onToggleFavorite is provided', () => {
    render(<MediaCard {...defaultProps} onToggleFavorite={vi.fn()} />)
    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument()
  })

  it('does not render favorite button when onToggleFavorite is absent', () => {
    render(<MediaCard {...defaultProps} />)
    expect(screen.queryByLabelText('Add to favorites')).toBeNull()
  })

  it('shows "Remove from favorites" when isFavorite is true', () => {
    render(<MediaCard {...defaultProps} isFavorite={true} onToggleFavorite={vi.fn()} />)
    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument()
  })

  it('calls onToggleFavorite when favorite button is clicked', () => {
    const onToggle = vi.fn()
    const onClick = vi.fn()
    render(<MediaCard {...defaultProps} onClick={onClick} onToggleFavorite={onToggle} />)
    fireEvent.click(screen.getByLabelText('Add to favorites'))
    expect(onToggle).toHaveBeenCalledOnce()
    // click should not propagate to card
    expect(onClick).not.toHaveBeenCalled()
  })

  it('calls onPrefetch on mouse enter', () => {
    const onPrefetch = vi.fn()
    render(<MediaCard {...defaultProps} onPrefetch={onPrefetch} />)
    fireEvent.mouseEnter(screen.getByRole('button'))
    expect(onPrefetch).toHaveBeenCalledOnce()
  })

  it('uses provided ariaLabel', () => {
    render(<MediaCard {...defaultProps} ariaLabel="Custom label" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label')
  })

  it('generates default aria label from title, year, rating', () => {
    render(<MediaCard {...defaultProps} ariaLabel={undefined} />)
    const btn = screen.getByRole('button')
    expect(btn.getAttribute('aria-label')).toContain('Interstellar')
    expect(btn.getAttribute('aria-label')).toContain('2014')
    expect(btn.getAttribute('aria-label')).toContain('8.6')
  })

  it('renders with null posterPath (fallback image)', () => {
    render(<MediaCard {...defaultProps} posterPath={null} />)
    expect(screen.getByAltText('Interstellar')).toBeInTheDocument()
  })
})
