import { useNavigate } from 'react-router-dom'
import styles from './WelcomePage.module.css'

/** Number of film-strip frames rendered in each horizontal strip. */
const FRAME_COUNT = 14

/** Array of frame indices used to render each film strip. */
const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) => i)

/**
 * WelcomePage — cinematic splash screen shown before entering the app.
 *
 * Clicking the CTA navigates directly to the home page.
 */
export default function WelcomePage() {
  const navigate = useNavigate()

  return (
    <main className={styles.page} aria-label="Bienvenida a Cinescope">
      <div className={styles.content}>
        {/* Top film strip */}
        <div className={styles.filmStrip} aria-hidden="true">
          {FRAMES.map(i => (
            <div key={i} className={styles.frame} style={{ animationDelay: `${i * 0.12}s` }} />
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
          <button type="button" className={styles.ctaBtn} onClick={() => navigate('/')}>
            Entrar
          </button>
        </div>

        {/* Bottom film strip */}
        <div className={`${styles.filmStrip} ${styles.bottom}`} aria-hidden="true">
          {FRAMES.map(i => (
            <div key={i} className={styles.frame} style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
    </main>
  )
}
