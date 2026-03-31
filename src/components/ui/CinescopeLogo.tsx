import styles from './CinescopeLogo.module.css'

/** Props for CinescopeLogo */
interface CinescopeLogoProps {
  /** Visual variant controlling size and frame count. Defaults to `"navbar"`. */
  variant?: 'navbar' | 'hero'
  /** Optional extra CSS class applied to the root wrapper. */
  className?: string
}

/** Number of film-strip frames per variant */
const FRAME_COUNTS = { navbar: 6, hero: 14 } as const

/**
 * Shared CinescopeLogo component.
 *
 * - `variant="navbar"` — compact (6 frames, 8×5 px each), used in Navbar and LoginPage.
 * - `variant="hero"` — large (14 frames, 20×32 px each), used in WelcomePage-style contexts.
 */
export default function CinescopeLogo({ variant = 'navbar', className }: CinescopeLogoProps) {
  const frameCount = FRAME_COUNTS[variant]
  const frames = Array.from({ length: frameCount }, (_, i) => i)

  const filmStrip = (
    <div className={styles.filmStrip} aria-hidden="true">
      {frames.map(i => (
        <div key={i} className={styles.frame} style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
  )

  const logoText =
    variant === 'hero' ? (
      <h1 className={styles.logoHeading}>
        <span className={styles.logoWhite}>CINE</span>
        <span className={styles.logoAmber}>SCOPE</span>
      </h1>
    ) : (
      <span className={styles.navbarText}>
        <span className={styles.logoWhite}>CINE</span>
        <span className={styles.logoAmber}>SCOPE</span>
      </span>
    )

  return (
    <div
      className={`${styles.wrap}${className ? ` ${className}` : ''}`}
      data-variant={variant}
    >
      {filmStrip}
      {logoText}
      {filmStrip}
    </div>
  )
}
