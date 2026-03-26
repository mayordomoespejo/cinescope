import { useState, useEffect, useCallback } from 'react'
import type { User } from 'firebase/auth'
import {
  onAuthStateChanged,
  signInWithEmail,
  signUpWithEmail,
  smartAuth,
  signInWithGoogle,
  signOut,
} from './authService'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signInWithEmail: (email: string, password: string) => Promise<User>
  signUpWithEmail: (email: string, password: string) => Promise<User>
  smartAuth: (email: string, password: string) => Promise<User>
  signInWithGoogle: () => Promise<User>
  signOut: () => Promise<void>
}

/**
 * React hook that tracks Firebase authentication state.
 * Provides reactive user state and convenience wrappers for auth actions.
 * @returns Auth state and action functions.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(currentUser => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleSignInWithEmail = useCallback(
    (email: string, password: string) => signInWithEmail(email, password),
    []
  )

  const handleSignUpWithEmail = useCallback(
    (email: string, password: string) => signUpWithEmail(email, password),
    []
  )

  const handleSmartAuth = useCallback(
    (email: string, password: string) => smartAuth(email, password),
    []
  )

  const handleSignInWithGoogle = useCallback(() => signInWithGoogle(), [])

  const handleSignOut = useCallback(() => signOut(), [])

  return {
    user,
    loading,
    isAuthenticated: user !== null,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    smartAuth: handleSmartAuth,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
  }
}
