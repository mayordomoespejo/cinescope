import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// ── Helpers ───────────────────────────────────────────────────────────

/** A child that throws synchronously during render when `shouldThrow` is true. */
function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Render error')
  }
  return <div>child content</div>
}

/**
 * React prints an error to the console whenever componentDidCatch fires.
 * Silence those expected console.error calls to keep the test output clean.
 */
function suppressConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => {})
}

/**
 * Creates a rejected promise that is immediately handled (so the JS engine
 * does not emit an unhandledrejection for it), then dispatches a synthetic
 * PromiseRejectionEvent that points to the supplied reason.
 *
 * This allows ErrorBoundary's `unhandledrejection` listener to fire inside
 * the test environment without Vitest treating the rejection as a leaked
 * unhandled promise.
 */
function fireUnhandledRejection(reason: unknown) {
  // Suppress the native unhandled rejection by immediately catching it.
  const p = Promise.reject(reason)
  p.catch(() => {})

  window.dispatchEvent(
    new PromiseRejectionEvent('unhandledrejection', {
      promise: p,
      reason,
      cancelable: true,
      bubbles: true,
    })
  )
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when no error occurs', () => {
    it('renders children normally', () => {
      render(
        <ErrorBoundary>
          <p>Hello world</p>
        </ErrorBoundary>
      )
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('does not render the fallback UI', () => {
      render(
        <ErrorBoundary fallback={<p>fallback</p>}>
          <p>content</p>
        </ErrorBoundary>
      )
      expect(screen.queryByText('fallback')).not.toBeInTheDocument()
    })
  })

  describe('when a child throws during render', () => {
    it('shows the default fallback UI', () => {
      suppressConsoleError()

      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow />
        </ErrorBoundary>
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('shows a custom fallback when provided', () => {
      suppressConsoleError()

      render(
        <ErrorBoundary fallback={<p>custom fallback</p>}>
          <ThrowingChild shouldThrow />
        </ErrorBoundary>
      )

      expect(screen.getByText('custom fallback')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('does not render children after the error', () => {
      suppressConsoleError()

      render(
        <ErrorBoundary>
          <ThrowingChild shouldThrow />
        </ErrorBoundary>
      )

      expect(screen.queryByText('child content')).not.toBeInTheDocument()
    })
  })

  describe('catchAsyncErrors prop', () => {
    it('shows fallback UI on unhandledrejection when catchAsyncErrors is true', async () => {
      suppressConsoleError()

      render(
        <ErrorBoundary catchAsyncErrors>
          <p>async child</p>
        </ErrorBoundary>
      )

      expect(screen.getByText('async child')).toBeInTheDocument()

      await act(async () => {
        fireUnhandledRejection(new Error('async error'))
      })

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('wraps a non-Error rejection reason in an Error', async () => {
      suppressConsoleError()

      render(
        <ErrorBoundary catchAsyncErrors>
          <p>child</p>
        </ErrorBoundary>
      )

      await act(async () => {
        fireUnhandledRejection('string reason')
      })

      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('does NOT catch unhandledrejection when catchAsyncErrors is false (default)', async () => {
      render(
        <ErrorBoundary>
          <p>safe child</p>
        </ErrorBoundary>
      )

      await act(async () => {
        fireUnhandledRejection(new Error('ignored'))
      })

      expect(screen.getByText('safe child')).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does NOT catch unhandledrejection when catchAsyncErrors is explicitly false', async () => {
      render(
        <ErrorBoundary catchAsyncErrors={false}>
          <p>safe child</p>
        </ErrorBoundary>
      )

      await act(async () => {
        fireUnhandledRejection(new Error('ignored'))
      })

      expect(screen.getByText('safe child')).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
