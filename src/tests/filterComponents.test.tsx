/**
 * Tests for filter components: GenreFilter, SortDropdown
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GenreFilter from '@/features/filters/components/GenreFilter'
import SortDropdown from '@/features/filters/components/SortDropdown'
import type { SortOption } from '@/lib/config'

// Mock useGenres hook
vi.mock('@/features/filters/hooks/useGenres', () => ({
  useGenres: vi.fn(),
}))

// Mock Chip
vi.mock('@/components/ui/Chip', () => ({
  default: ({
    label,
    active,
    onClick,
  }: {
    label: string
    active?: boolean
    onClick?: () => void
  }) => (
    <button onClick={onClick} aria-pressed={active ?? false} data-testid={`chip-${label}`}>
      {label}
    </button>
  ),
}))

// Mock Radix dropdown
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({
    children,
    'aria-label': ariaLabel,
    className,
  }: {
    children: React.ReactNode
    'aria-label'?: string
    className?: string
  }) => (
    <button aria-label={ariaLabel} className={className}>
      {children}
    </button>
  ),
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Content: ({ children }: { children: React.ReactNode }) => <div role="menu">{children}</div>,
  Item: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode
    onSelect?: () => void
    className?: string
  }) => (
    <button role="menuitem" onClick={onSelect}>
      {children}
    </button>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// ── GenreFilter ────────────────────────────────────────────────────────

describe('GenreFilter', () => {
  it('shows skeleton while loading', async () => {
    const { useGenres } = await import('@/features/filters/hooks/useGenres')
    vi.mocked(useGenres).mockReturnValue({ data: [], isLoading: true } as unknown as ReturnType<
      typeof useGenres
    >)

    const { container } = render(<GenreFilter selectedGenreId={null} onSelect={vi.fn()} />)
    // Skeleton rendered with aria-hidden
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('renders "All" chip when not loading', async () => {
    const { useGenres } = await import('@/features/filters/hooks/useGenres')
    vi.mocked(useGenres).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<
      typeof useGenres
    >)

    render(<GenreFilter selectedGenreId={null} onSelect={vi.fn()} />)
    expect(screen.getByTestId('chip-All')).toBeInTheDocument()
  })

  it('renders genre chips', async () => {
    const { useGenres } = await import('@/features/filters/hooks/useGenres')
    vi.mocked(useGenres).mockReturnValue({
      data: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
      ],
      isLoading: false,
    } as ReturnType<typeof useGenres>)

    render(<GenreFilter selectedGenreId={null} onSelect={vi.fn()} />)
    expect(screen.getByTestId('chip-Action')).toBeInTheDocument()
    expect(screen.getByTestId('chip-Adventure')).toBeInTheDocument()
  })

  it('"All" chip is active when selectedGenreId is null', async () => {
    const { useGenres } = await import('@/features/filters/hooks/useGenres')
    vi.mocked(useGenres).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<
      typeof useGenres
    >)

    render(<GenreFilter selectedGenreId={null} onSelect={vi.fn()} />)
    expect(screen.getByTestId('chip-All')).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onSelect with null when "All" clicked', async () => {
    const { useGenres } = await import('@/features/filters/hooks/useGenres')
    vi.mocked(useGenres).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<
      typeof useGenres
    >)

    const onSelect = vi.fn()
    render(<GenreFilter selectedGenreId={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('chip-All'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('calls onSelect with genre id when genre chip clicked', async () => {
    const { useGenres } = await import('@/features/filters/hooks/useGenres')
    vi.mocked(useGenres).mockReturnValue({
      data: [{ id: 28, name: 'Action' }],
      isLoading: false,
    } as ReturnType<typeof useGenres>)

    const onSelect = vi.fn()
    render(<GenreFilter selectedGenreId={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByTestId('chip-Action'))
    expect(onSelect).toHaveBeenCalledWith(28)
  })

  it('marks selected genre chip as active', async () => {
    const { useGenres } = await import('@/features/filters/hooks/useGenres')
    vi.mocked(useGenres).mockReturnValue({
      data: [{ id: 28, name: 'Action' }],
      isLoading: false,
    } as ReturnType<typeof useGenres>)

    render(<GenreFilter selectedGenreId={28} onSelect={vi.fn()} />)
    expect(screen.getByTestId('chip-Action')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('chip-All')).toHaveAttribute('aria-pressed', 'false')
  })
})

// ── SortDropdown ───────────────────────────────────────────────────────

describe('SortDropdown', () => {
  const value: SortOption = 'popularity.desc'

  it('renders trigger with aria-label', () => {
    render(<SortDropdown value={value} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Sort movies by' })).toBeInTheDocument()
  })

  it('shows current sort label in trigger', () => {
    render(<SortDropdown value={value} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Sort movies by' })).toHaveTextContent('Most Popular')
  })

  it('renders all sort options as menu items', () => {
    render(<SortDropdown value={value} onChange={vi.fn()} />)
    const items = screen.getAllByRole('menuitem')
    expect(items.length).toBe(5)
  })

  it('calls onChange with correct value when item selected', () => {
    const onChange = vi.fn()
    render(<SortDropdown value={value} onChange={onChange} />)
    const items = screen.getAllByRole('menuitem')
    // Second item is "Highest Rated"
    fireEvent.click(items[1])
    expect(onChange).toHaveBeenCalledWith('vote_average.desc')
  })

  it('shows "Highest Rated" as current when selected', () => {
    render(<SortDropdown value={'vote_average.desc' as SortOption} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Sort movies by' })).toHaveTextContent(
      'Highest Rated'
    )
  })
})
