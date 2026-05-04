import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mapFirebaseError } from '@/lib/firebaseErrors'

// ── Firebase module mock ──────────────────────────────────────────────
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

vi.mock('firebase/auth', () => {
  class GoogleAuthProvider {}
  return {
    getAuth: vi.fn(() => ({ currentUser: null })),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    reauthenticateWithPopup: vi.fn(),
    GoogleAuthProvider,
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    deleteUser: vi.fn(),
  }
})

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

import { signInWithEmail, signUpWithEmail, smartAuth } from '@/features/auth/authService'

// ── Helpers ───────────────────────────────────────────────────────────

function makeFirebaseUser(uid = 'uid-1') {
  return { uid, email: 'test@example.com' }
}

function makeFirebaseError(code: string) {
  return Object.assign(new Error(code), { code })
}

// ── mapFirebaseError ──────────────────────────────────────────────────

describe('mapFirebaseError', () => {
  it('maps auth/wrong-password to Spanish message', () => {
    expect(mapFirebaseError('auth/wrong-password')).toBe('Contraseña incorrecta')
  })

  it('maps auth/invalid-credential to the same message as wrong-password', () => {
    expect(mapFirebaseError('auth/invalid-credential')).toBe('Contraseña incorrecta')
  })

  it('maps auth/user-not-found to Spanish message', () => {
    expect(mapFirebaseError('auth/user-not-found')).toBe('No existe una cuenta con este email')
  })

  it('maps auth/too-many-requests to Spanish message', () => {
    expect(mapFirebaseError('auth/too-many-requests')).toBe(
      'Demasiados intentos. Espera un momento'
    )
  })

  it('maps auth/network-request-failed to Spanish message', () => {
    expect(mapFirebaseError('auth/network-request-failed')).toBe(
      'Error de red. Comprueba tu conexión'
    )
  })

  it('returns the fallback message for an unknown error code', () => {
    expect(mapFirebaseError('auth/unknown-code')).toBe('Ha ocurrido un error. Inténtalo de nuevo')
  })

  it('returns the fallback message for an empty string', () => {
    expect(mapFirebaseError('')).toBe('Ha ocurrido un error. Inténtalo de nuevo')
  })
})

// ── signInWithEmail ───────────────────────────────────────────────────

describe('signInWithEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the user from Firebase on success', async () => {
    const user = makeFirebaseUser()
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user } as never)

    const result = await signInWithEmail('test@example.com', 'password')

    expect(result).toBe(user)
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    )
  })

  it('propagates Firebase errors', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
      makeFirebaseError('auth/wrong-password')
    )

    await expect(signInWithEmail('test@example.com', 'wrong')).rejects.toMatchObject({
      code: 'auth/wrong-password',
    })
  })
})

// ── signUpWithEmail ───────────────────────────────────────────────────

describe('signUpWithEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the new user from Firebase on success', async () => {
    const user = makeFirebaseUser('new-uid')
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user } as never)

    const result = await signUpWithEmail('new@example.com', 'password')

    expect(result).toBe(user)
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'new@example.com',
      'password'
    )
  })

  it('propagates Firebase errors', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
      makeFirebaseError('auth/email-already-in-use')
    )

    await expect(signUpWithEmail('existing@example.com', 'password')).rejects.toMatchObject({
      code: 'auth/email-already-in-use',
    })
  })
})

// ── smartAuth ─────────────────────────────────────────────────────────

describe('smartAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers a new user when sign-up succeeds', async () => {
    const user = makeFirebaseUser()
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user } as never)

    const result = await smartAuth('new@example.com', 'password')

    expect(result).toBe(user)
    expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(1)
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled()
  })

  it('falls back to sign-in when the email is already in use', async () => {
    const user = makeFirebaseUser()
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
      makeFirebaseError('auth/email-already-in-use')
    )
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user } as never)

    const result = await smartAuth('existing@example.com', 'password')

    expect(result).toBe(user)
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1)
  })

  it('rethrows errors that are not auth/email-already-in-use', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
      makeFirebaseError('auth/too-many-requests')
    )

    await expect(smartAuth('test@example.com', 'password')).rejects.toMatchObject({
      code: 'auth/too-many-requests',
    })
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled()
  })
})
