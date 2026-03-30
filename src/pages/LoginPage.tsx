import { useState, useRef, type FormEvent } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import styles from './LoginPage.module.css'
import CinescopeLogo from '@/components/ui/CinescopeLogo'

// ─── Firebase error → Spanish message map ───────────────────────────────────

/**
 * Maps Firebase auth error codes to user-friendly Spanish messages.
 * @param code - Firebase error code string.
 * @returns A localised error message.
 */
function mapFirebaseError(code: string): string {
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Contraseña incorrecta'
  }
  if (code === 'auth/user-not-found') {
    return 'No existe una cuenta con este email'
  }
  if (code === 'auth/too-many-requests') {
    return 'Demasiados intentos. Espera un momento'
  }
  if (code === 'auth/network-request-failed') {
    return 'Error de red. Comprueba tu conexión'
  }
  return 'Ha ocurrido un error. Inténtalo de nuevo'
}

// ─── Email regex ─────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Google icon (inline SVG) ─────────────────────────────────────────────

/**
 * Renders the Google brand SVG icon.
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  )
}

// ─── Eye toggle icon ──────────────────────────────────────────────────────────

/**
 * Renders an eye / eye-off SVG icon for the password visibility toggle.
 * @param visible - Whether the password is currently visible.
 */
function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// ─── LoginPage ────────────────────────────────────────────────────────────────

/**
 * LoginPage — unified smart auth form (sign-in + sign-up in one step).
 *
 * Uses Firebase `smartAuth` to handle both existing and new accounts transparently.
 * Redirects to `/` on successful authentication.
 * Redirects immediately if the user is already authenticated.
 */
export default function LoginPage() {
  const { loading, isAuthenticated, smartAuth, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [serverError, setServerError] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // readOnly trick: suppress Chrome password manager popup until user focuses
  const passwordReadOnly = useRef(true)

  if (loading) return null
  if (isAuthenticated) return <Navigate to="/" replace />

  /** Validate fields and return true if form is valid. */
  function validate(): boolean {
    let valid = true

    if (!EMAIL_RE.test(email)) {
      setEmailError('Introduce un email válido')
      valid = false
    } else {
      setEmailError('')
    }

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      valid = false
    } else {
      setPasswordError('')
    }

    return valid
  }

  /** Handle email+password form submission. */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await smartAuth(email, password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setServerError(mapFirebaseError(code))
    } finally {
      setSubmitting(false)
    }
  }

  /** Handle Google sign-in. */
  async function handleGoogle() {
    setServerError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setServerError(mapFirebaseError(code))
    } finally {
      setGoogleLoading(false)
    }
  }

  const busy = submitting || googleLoading

  return (
    <main className={styles.page} aria-label="Inicio de sesión">
      <div className={styles.card}>
        {/* Logo */}
        <Link to="/welcome" className={styles.logoLink} aria-label="Volver a inicio">
          <CinescopeLogo variant="navbar" />
        </Link>

        {/* Heading */}
        <div className={styles.heading}>
          <h1 className={styles.title}>Bienvenido</h1>
          <p className={styles.subtitle}>Inicia sesión o crea una cuenta para continuar</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className={`${styles.field} ${emailError ? styles.fieldWithError : ''}`}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className={styles.input}
              placeholder="tu@email.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                if (emailError) setEmailError('')
              }}
              disabled={busy}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <span id="email-error" className={styles.fieldError} role="alert">
                {emailError}
              </span>
            )}
          </div>

          {/* Password */}
          <div className={`${styles.field} ${passwordError ? styles.fieldWithError : ''}`}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.inputWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`${styles.input} ${styles.inputWithToggle}`}
                placeholder="Mínimo 6 caracteres"
                value={password}
                // readOnly trick: prevents Chrome from auto-filling/showing manager popup
                readOnly={passwordReadOnly.current}
                onFocus={() => {
                  passwordReadOnly.current = false
                }}
                onChange={e => {
                  setPassword(e.target.value)
                  if (passwordError) setPasswordError('')
                }}
                disabled={busy}
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {passwordError && (
              <span id="password-error" className={styles.fieldError} role="alert">
                {passwordError}
              </span>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p className={styles.serverError} role="alert">
              {serverError}
            </p>
          )}

          {/* Submit */}
          <button type="submit" className={styles.submitBtn} disabled={busy} aria-busy={submitting}>
            {submitting && <span className={styles.spinner} aria-hidden="true" />}
            <span className={`${styles.btnText} ${submitting ? styles.hidden : ''}`}>
              Continuar
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true">
          o
        </div>

        {/* Google */}
        <button
          type="button"
          className={styles.googleBtn}
          onClick={handleGoogle}
          disabled={busy}
          aria-busy={googleLoading}
        >
          {googleLoading ? (
            <span
              className={styles.spinner}
              style={{ borderTopColor: '#4285F4', borderColor: 'rgba(66,133,244,0.3)' }}
              aria-hidden="true"
            />
          ) : (
            <GoogleIcon className={styles.googleIcon} />
          )}
          Continuar con Google
        </button>
      </div>
    </main>
  )
}
