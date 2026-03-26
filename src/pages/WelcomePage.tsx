import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import styles from './WelcomePage.module.css'

/** Number of film-strip frames rendered above and below the logo. */
const FRAME_COUNT = 14

/** Array of frame indices used to render the film strip decoration. */
const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => i)

/**
 * WelcomePage — cinematic splash screen shown to unauthenticated users.
 *
 * Redirects immediately to `/` when the user is already authenticated.
 * While Firebase auth state is resolving, renders nothing to avoid flash.
 */
export default function WelcomePage() {
  const { loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (loading) return null
  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <main className={styles.page} aria-label="Bienvenida a Cinescope">
      <div className={styles.content}>
        {/* Film strip — top */}
        <div className={styles.filmStrip} aria-hidden="true">
          {FRAMES.map(i => (
            <div key={i} className={styles.frame} />
          ))}
        </div>

        {/* Logo + tagline */}
        <div className={styles.logoWrap}>
          <h1 className={styles.logo}>
            <span className={styles.logoWhite}>CINE</span>
            <span className={styles.logoAmber}>SCOPE</span>
          </h1>

          <p className={styles.tagline}>Discover. Save. Watch.</p>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <button type="button" className={styles.ctaBtn} onClick={() => navigate('/login')}>
            Entrar
          </button>
        </div>

        {/* Film strip — bottom */}
        <div className={`${styles.filmStrip} ${styles.bottom}`} aria-hidden="true">
          {FRAMES.map(i => (
            <div key={i} className={styles.frame} />
          ))}
        </div>
      </div>
    </main>
  )
}
