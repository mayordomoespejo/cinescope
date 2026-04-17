import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useLoginForm } from '@/features/auth/components/useLoginForm'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import CinescopeLogo from '@/components/ui/CinescopeLogo'
import styles from './LoginPage.module.css'

/**
 * LoginPage — unified smart auth form (sign-in + sign-up in one step).
 *
 * Uses Firebase `smartAuth` to handle both existing and new accounts transparently.
 * Redirects to `/` on successful authentication.
 * Redirects immediately if the user is already authenticated.
 */
export default function LoginPage() {
  const { loading, isAuthenticated } = useAuth()
  const form = useLoginForm()

  if (loading) return null
  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <main className={styles.page} aria-label="Inicio de sesión">
      <div className={styles.card}>
        <Link to="/welcome" className={styles.logoLink} aria-label="Volver a inicio">
          <CinescopeLogo variant="navbar" />
        </Link>

        <div className={styles.heading}>
          <h1 className={styles.title}>Bienvenido</h1>
          <p className={styles.subtitle}>Inicia sesión o crea una cuenta para continuar</p>
        </div>

        <LoginForm
          email={form.email}
          password={form.password}
          showPassword={form.showPassword}
          emailError={form.emailError}
          passwordError={form.passwordError}
          serverError={form.serverError}
          submitting={form.submitting}
          busy={form.busy}
          setEmail={form.setEmail}
          setPassword={form.setPassword}
          setShowPassword={form.setShowPassword}
          clearEmailError={form.clearEmailError}
          clearPasswordError={form.clearPasswordError}
          handleSubmit={form.handleSubmit}
        />

        <div className={styles.divider} aria-hidden="true">
          o
        </div>

        <GoogleSignInButton
          onClick={form.handleGoogle}
          disabled={form.busy}
          loading={form.googleLoading}
        />
      </div>
    </main>
  )
}
