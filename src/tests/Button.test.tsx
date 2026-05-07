import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('is not disabled by default', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner when loading', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByRole('button').querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('is disabled when loading', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not show spinner when not loading', () => {
    render(<Button>Click</Button>)
    expect(screen.queryByRole('button')?.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('applies additional className', () => {
    render(<Button className="custom-class">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('forwards button type attribute', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})
