import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import styles from '../Navbar.module.css'
import CinescopeLogo from '../CinescopeLogo'
import NavSearchBar from './NavSearchBar'
import NavThemeToggle from './NavThemeToggle'
import NavFavoritesLink from './NavFavoritesLink'

/** Props for the Navbar component. */
interface NavbarProps {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
}

/**
 * Top navigation bar with logo, nav links, debounced search with history dropdown,
 * theme toggle, and favorites shortcut.
 * @param props - Component props
 */
export default function Navbar({ theme, onThemeToggle }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <div className={styles.inner}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo} aria-label="CineScope Home">
          <CinescopeLogo variant="navbar" />
        </NavLink>

        {/* Nav links */}
        <nav className={styles.nav} aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/tv"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            TV Shows
          </NavLink>
          <NavLink
            to="/watched"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Watched
          </NavLink>
        </nav>

        {/* Search */}
        <NavSearchBar />

        {/* Right controls */}
        <div className={styles.rightControls}>
          <NavFavoritesLink />
          <NavThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
      </div>
    </header>
  )
}
