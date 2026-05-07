import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chip from '@/components/ui/Chip'

describe('Chip', () => {
  it('renders the label', () => {
    render(<Chip label="Action" />)
    expect(screen.getByRole('button')).toHaveTextContent('Action')
  })

  it('is not pressed by default', () => {
    render(<Chip label="Action" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('has aria-pressed=true when active', () => {
    render(<Chip label="Action" active />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Chip label="Action" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders remove button when onRemove is provided', () => {
    render(<Chip label="Action" onRemove={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Remove Action/i })).toBeInTheDocument()
  })

  it('does not render remove button when onRemove is absent', () => {
    render(<Chip label="Action" />)
    expect(screen.queryByRole('button', { name: /Remove/i })).toBeNull()
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<Chip label="Action" onRemove={onRemove} />)
    await user.click(screen.getByRole('button', { name: /Remove Action/i }))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('does not propagate click from remove button to chip', () => {
    const onClick = vi.fn()
    const onRemove = vi.fn()
    render(<Chip label="Action" onClick={onClick} onRemove={onRemove} />)
    const removeBtn = screen.getByRole('button', { name: /Remove Action/i })
    fireEvent.click(removeBtn)
    expect(onRemove).toHaveBeenCalledOnce()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<Chip label="Action" onRemove={onRemove} />)
    const removeBtn = screen.getByRole('button', { name: /Remove Action/i })
    fireEvent.click(removeBtn)
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('remove button is a native button (keyboard accessible by default)', () => {
    const onRemove = vi.fn()
    render(<Chip label="Action" onRemove={onRemove} />)
    const removeBtn = screen.getByRole('button', { name: /Remove Action/i })
    expect(removeBtn.tagName).toBe('BUTTON')
  })

  it('does not call onRemove on other keys', () => {
    const onRemove = vi.fn()
    render(<Chip label="Action" onRemove={onRemove} />)
    const removeBtn = screen.getByRole('button', { name: /Remove Action/i })
    fireEvent.keyDown(removeBtn, { key: 'Tab' })
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('applies additional className', () => {
    render(<Chip label="Action" className="extra" />)
    expect(screen.getByRole('button')).toHaveClass('extra')
  })
})
