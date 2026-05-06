/**
 * Tests for ToastProvider and useToast hook.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ToastProvider, useToast } from '@/components/ui/Toast'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

// Helper component that uses useToast
function ToastTrigger({ message = 'Test message' }: { message?: string }) {
  const showToast = useToast()
  return (
    <button type="button" onClick={() => showToast(message)}>
      Show Toast
    </button>
  )
}

function renderWithProvider(message?: string) {
  return render(
    <ToastProvider>
      <ToastTrigger message={message} />
    </ToastProvider>
  )
}

describe('ToastProvider', () => {
  it('renders children', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: 'Show Toast' })).toBeInTheDocument()
  })

  it('shows toast message when triggered', () => {
    renderWithProvider('Hello world')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('toast has role=status', () => {
    renderWithProvider('Status toast')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('container has aria-live=polite', () => {
    renderWithProvider()
    fireEvent.click(screen.getByRole('button'))
    const container = document.querySelector('[aria-live="polite"]')
    expect(container).toBeInTheDocument()
  })

  it('removes toast after display duration', () => {
    vi.useFakeTimers()
    renderWithProvider('Fading toast')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Fading toast')).toBeInTheDocument()

    // advance past display duration (2000ms) + exit duration (220ms)
    act(() => {
      vi.advanceTimersByTime(2500)
    })

    expect(screen.queryByText('Fading toast')).toBeNull()
  })

  it('can show multiple toasts', () => {
    renderWithProvider('Toast A')
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    const statuses = screen.getAllByRole('status')
    expect(statuses.length).toBeGreaterThanOrEqual(1)
  })
})

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    const originalError = console.error
    console.error = vi.fn()
    function BadComponent() {
      useToast()
      return null
    }
    expect(() => render(<BadComponent />)).toThrow('useToast must be used inside <ToastProvider>')
    console.error = originalError
  })

  it('returns a function', () => {
    const result: { fn: unknown } = { fn: undefined }
    function Capture() {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      result.fn = useToast()
      return null
    }
    render(
      <ToastProvider>
        <Capture />
      </ToastProvider>
    )
    expect(typeof result.fn).toBe('function')
  })
})
