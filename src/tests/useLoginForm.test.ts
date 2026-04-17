import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useLoginForm } from '@/features/auth/components/useLoginForm'
import { strings } from '@/lib/i18n'

// ── Module mocks ─────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('@/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

// ── Helpers ───────────────────────────────────────────────────────────

function makeAuthMock(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  return {
    user: null,
    loading: false,
    isAuthenticated: false,
    smartAuth: vi.fn().mockResolvedValue(undefined),
    signInWithEmail: vi.fn().mockResolvedValue(undefined),
    signUpWithEmail: vi.fn().mockResolvedValue(undefined),
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as ReturnType<typeof useAuth>
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('useLoginForm', () => {
  let mockNavigate: ReturnType<typeof vi.fn>
  let mockAuth: ReturnType<typeof makeAuthMock>

  beforeEach(() => {
    mockNavigate = vi.fn()
    mockAuth = makeAuthMock()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useAuth).mockReturnValue(mockAuth)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has empty email, password, and no errors', () => {
      const { result } = renderHook(() => useLoginForm())

      expect(result.current.email).toBe('')
      expect(result.current.password).toBe('')
      expect(result.current.showPassword).toBe(false)
      expect(result.current.emailError).toBe('')
      expect(result.current.passwordError).toBe('')
      expect(result.current.serverError).toBe('')
      expect(result.current.submitting).toBe(false)
      expect(result.current.googleLoading).toBe(false)
      expect(result.current.busy).toBe(false)
    })
  })

  describe('validate()', () => {
    it('returns false and sets emailError for empty email', async () => {
      const { result } = renderHook(() => useLoginForm())

      // Set valid password, leave email empty
      act(() => { result.current.setPassword('validpassword') })

      // Trigger submit with empty email to invoke validate()
      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent)
      })

      expect(result.current.emailError).toBe(strings.auth.emailInvalid)
      expect(mockAuth.smartAuth).not.toHaveBeenCalled()
    })

    it('returns false and sets emailError for invalid email format', async () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.setEmail('not-an-email')
        result.current.setPassword('validpassword')
      })

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent)
      })

      expect(result.current.emailError).toBe(strings.auth.emailInvalid)
      expect(mockAuth.smartAuth).not.toHaveBeenCalled()
    })

    it('returns false and sets passwordError for short password (< 6 chars)', async () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.setEmail('user@example.com')
        result.current.setPassword('abc')
      })

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent)
      })

      expect(result.current.passwordError).toBe(strings.auth.passwordTooShort)
      expect(mockAuth.smartAuth).not.toHaveBeenCalled()
    })

    it('returns true and clears errors for valid inputs', async () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.setEmail('user@example.com')
        result.current.setPassword('securepass')
      })

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent)
      })

      expect(result.current.emailError).toBe('')
      expect(result.current.passwordError).toBe('')
      expect(mockAuth.smartAuth).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleSubmit', () => {
    it('calls smartAuth with email and password on valid form', async () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.setEmail('user@example.com')
        result.current.setPassword('securepass')
      })

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent)
      })

      expect(mockAuth.smartAuth).toHaveBeenCalledWith('user@example.com', 'securepass')
    })

    it('navigates to "/" on successful sign-in', async () => {
      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.setEmail('user@example.com')
        result.current.setPassword('securepass')
      })

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })

    it('sets serverError when smartAuth rejects', async () => {
      mockAuth.smartAuth = vi.fn().mockRejectedValue(
        Object.assign(new Error('auth/wrong-password'), { code: 'auth/wrong-password' })
      )
      vi.mocked(useAuth).mockReturnValue(mockAuth)

      const { result } = renderHook(() => useLoginForm())

      act(() => {
        result.current.setEmail('user@example.com')
        result.current.setPassword('wrongpass')
      })

      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent)
      })

      expect(result.current.serverError).not.toBe('')
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('does not call smartAuth when form is invalid', async () => {
      const { result } = renderHook(() => useLoginForm())

      // Both fields empty — validation fails
      await act(async () => {
        await result.current.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent)
      })

      expect(mockAuth.smartAuth).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('handleGoogle', () => {
    it('calls signInWithGoogle', async () => {
      const { result } = renderHook(() => useLoginForm())

      await act(async () => {
        await result.current.handleGoogle()
      })

      expect(mockAuth.signInWithGoogle).toHaveBeenCalledTimes(1)
    })

    it('navigates to "/" on successful Google sign-in', async () => {
      const { result } = renderHook(() => useLoginForm())

      await act(async () => {
        await result.current.handleGoogle()
      })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })

    it('sets serverError when signInWithGoogle rejects', async () => {
      mockAuth.signInWithGoogle = vi.fn().mockRejectedValue(
        Object.assign(new Error('auth/popup-closed-by-user'), { code: 'auth/popup-closed-by-user' })
      )
      vi.mocked(useAuth).mockReturnValue(mockAuth)

      const { result } = renderHook(() => useLoginForm())

      await act(async () => {
        await result.current.handleGoogle()
      })

      expect(result.current.serverError).not.toBe('')
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('sets googleLoading to true during sign-in and false after', async () => {
      let resolveGoogle!: () => void
      mockAuth.signInWithGoogle = vi.fn().mockReturnValue(
        new Promise<void>(resolve => { resolveGoogle = resolve })
      )
      vi.mocked(useAuth).mockReturnValue(mockAuth)

      const { result } = renderHook(() => useLoginForm())

      // Start Google sign-in without awaiting
      act(() => { void result.current.handleGoogle() })

      expect(result.current.googleLoading).toBe(true)
      expect(result.current.busy).toBe(true)

      // Resolve and verify cleanup
      await act(async () => { resolveGoogle() })

      await waitFor(() => expect(result.current.googleLoading).toBe(false))
    })
  })
})
