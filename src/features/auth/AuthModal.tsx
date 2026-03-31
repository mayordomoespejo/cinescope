import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import styles from './AuthModal.module.css'
import { signInWithGoogle, smartAuth } from './authService'

/** Props for the AuthModal component. */
interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * @description Modal dialog for user authentication. Supports email+password (sign in or sign up) and Google OAuth via Firebase.
 * @param props - Component props
 */
export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetState = () => {
    setEmail('')
    setPassword('')
    setError(null)
    setIsLoading(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetState()
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setError(null)
    setIsLoading(true)
    try {
      await smartAuth(email.trim(), password)
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signInWithGoogle()
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby="auth-modal-desc">
          <VisuallyHidden asChild>
            <Dialog.Description id="auth-modal-desc">
              Sign in to CineScope to sync your favorites and watchlist across devices.
            </Dialog.Description>
          </VisuallyHidden>

          <Dialog.Close asChild>
            <button className={styles.closeBtn} aria-label="Close sign in dialog">
              ✕
            </button>
          </Dialog.Close>

          <Dialog.Title asChild>
            <div className={styles.header}>
              <h2 className={styles.title}>Sign in</h2>
              <p className={styles.subtitle}>Sync your favorites and watchlist across devices</p>
            </div>
          </Dialog.Title>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.fieldLabel}>
              Email address
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                disabled={isLoading}
              />
            </label>

            <label className={styles.fieldLabel}>
              Password
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </label>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? 'Signing in…' : 'Sign in / Sign up'}
            </button>
          </form>

          <div className={styles.divider} aria-hidden="true">
            or
          </div>

          <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogle}
            disabled={isLoading}
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
