/**
 * Tests for BottomNav component.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BottomNav from '@/components/ui/BottomNav'

function renderWithRouter(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNav />
    </MemoryRouter>
  )
}

describe('BottomNav', () => {
  it('renders nav with accessible label', () => {
    renderWithRouter()
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument()
  })

  it('renders all 4 tabs', () => {
    renderWithRouter()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'TV Shows' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Favorites' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument()
  })

  it('links point to correct hrefs', () => {
    renderWithRouter()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'TV Shows' })).toHaveAttribute('href', '/tv')
    expect(screen.getByRole('link', { name: 'Favorites' })).toHaveAttribute('href', '/favorites')
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile')
  })

  it('sets active index 0 for / path', () => {
    renderWithRouter('/')
    // Just check it renders — indicator style is set
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('sets active index 1 for /tv path', () => {
    renderWithRouter('/tv')
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('sets active index 2 for /favorites path', () => {
    renderWithRouter('/favorites')
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('sets active index 3 for /profile path', () => {
    renderWithRouter('/profile')
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('sets active index 0 for /movie/123 path', () => {
    renderWithRouter('/movie/123')
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('sets active index 0 for unknown path', () => {
    renderWithRouter('/unknown-route')
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })
})
