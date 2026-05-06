/**
 * Tests for navbar components:
 * CinescopeLogo, NavThemeToggle, NavFavoritesLink, ScrollToTop, Navbar
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CinescopeLogo from '@/components/ui/CinescopeLogo'
import NavThemeToggle from '@/components/ui/navbar/NavThemeToggle'
import NavFavoritesLink from '@/components/ui/navbar/NavFavoritesLink'
import ScrollToTop from '@/components/ui/ScrollToTop'

vi.mock('@/components/ui/IconButton', () => ({
  default: ({
    children,
    onClick,
    'aria-label': ariaLabel,
    title,
  }: {
    children: React.ReactNode
    onClick?: () => void
    'aria-label'?: string
    title?: string
  }) => (
    <button onClick={onClick} aria-label={ariaLabel} title={title}>
      {children}
    </button>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// ── CinescopeLogo ─────────────────────────────────────────────────────

describe('CinescopeLogo', () => {
  it('renders CINE and SCOPE text', () => {
    render(<CinescopeLogo />)
    expect(screen.getAllByText('CINE').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('SCOPE').length).toBeGreaterThanOrEqual(1)
  })

  it('defaults to navbar variant', () => {
    const { container } = render(<CinescopeLogo />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveAttribute('data-variant', 'navbar')
  })

  it('renders hero variant', () => {
    const { container } = render(<CinescopeLogo variant="hero" />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveAttribute('data-variant', 'hero')
  })

  it('hero variant renders h1 for logo heading', () => {
    render(<CinescopeLogo variant="hero" />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('navbar variant renders span (not h1)', () => {
    render(<CinescopeLogo variant="navbar" />)
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })

  it('applies custom className', () => {
    const { container } = render(<CinescopeLogo className="extra-class" />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('extra-class')
  })

  it('navbar variant renders film strips', () => {
    const { container } = render(<CinescopeLogo variant="navbar" />)
    // 2 film strips with 6 frames each
    const filmStrips = container.querySelectorAll('[aria-hidden="true"]')
    expect(filmStrips.length).toBeGreaterThanOrEqual(2)
  })

  it('hero variant renders film strips', () => {
    const { container } = render(<CinescopeLogo variant="hero" />)
    const filmStrips = container.querySelectorAll('[aria-hidden="true"]')
    expect(filmStrips.length).toBeGreaterThanOrEqual(2)
  })
})

// ── NavThemeToggle ────────────────────────────────────────────────────

describe('NavThemeToggle', () => {
  it('renders a button', () => {
    render(<NavThemeToggle theme="dark" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows sun icon when dark mode', () => {
    render(<NavThemeToggle theme="dark" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('☀️')
  })

  it('shows moon icon when light mode', () => {
    render(<NavThemeToggle theme="light" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('🌙')
  })

  it('aria-label is "Switch to light mode" when dark', () => {
    render(<NavThemeToggle theme="dark" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode')
  })

  it('aria-label is "Switch to dark mode" when light', () => {
    render(<NavThemeToggle theme="light" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode')
  })

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn()
    render(<NavThemeToggle theme="dark" onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})

// ── NavFavoritesLink ──────────────────────────────────────────────────

describe('NavFavoritesLink', () => {
  it('renders a link to /favorites', () => {
    render(
      <MemoryRouter>
        <NavFavoritesLink />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: 'Favorites' })).toHaveAttribute('href', '/favorites')
  })
})

// ── ScrollToTop ───────────────────────────────────────────────────────

describe('ScrollToTop', () => {
  it('renders null', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('calls window.scrollTo on mount', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
      </MemoryRouter>
    )
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
    scrollToSpy.mockRestore()
  })
})
