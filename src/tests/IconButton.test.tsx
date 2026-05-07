import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IconButton from '@/components/ui/IconButton'

describe('IconButton', () => {
  it('renders a button', () => {
    render(<IconButton aria-label="icon" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has type=button by default', () => {
    render(<IconButton aria-label="icon" />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<IconButton aria-label="icon" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders children', () => {
    render(<IconButton aria-label="icon">X</IconButton>)
    expect(screen.getByRole('button')).toHaveTextContent('X')
  })

  it('applies additional className', () => {
    render(<IconButton aria-label="icon" className="extra" />)
    expect(screen.getByRole('button')).toHaveClass('extra')
  })

  it('is disabled when disabled prop is set', () => {
    render(<IconButton aria-label="icon" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders as child element when asChild is true', () => {
    render(
      <IconButton asChild aria-label="icon">
        <a href="/test">Link</a>
      </IconButton>
    )
    // Slot renders the child element itself
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveTextContent('Link')
  })
})
