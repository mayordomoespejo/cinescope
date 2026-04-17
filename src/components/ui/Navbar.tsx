import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Navbar.module.css'
import iconBtnStyles from './IconButton.module.css'
import IconButton from './IconButton'
import CinescopeLogo from './CinescopeLogo'
import { useNavSearch } from './navbar/useNavSearch'
import { useAuth } from '@/features/auth/useAuth'

/** Props for the Navbar component. */
interface NavbarProps {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
}

/**
 * @description Top navigation bar with logo, nav links, debounced search with history dropdown, theme toggle, and user auth menu.
 * @param props - Component props
 */
export default function Navbar({ theme, onThemeToggle }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false
  )

  const { user, loading: authLoading, signOut } = useAuth()

  const {
    query,
    focused,
    history,
    inputRef,
    handleChange,
    handleSubmit,
    handleFocus,
    handleBlur,
    handleHistoryClick,
    handleClear,
    handleHistoryClear,
  } = useNavSearch()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  // Derive user initials for avatar — Firebase user has displayName and email
  const userInitial =
    user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? '?'

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
        </nav>

        {/* Search */}
        <div className={styles.searchWrapper} role="search">
          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={isMobile ? 'Search movies…' : 'Search movies… ("/" to focus)'}
              className={styles.searchInput}
              aria-label="Search movies"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClear}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </form>

          {/* History dropdown */}
          <AnimatePresence>
            {focused && history.length > 0 && (
              <motion.div
                className={styles.historyDropdown}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                role="listbox"
                aria-label="Recent searches"
              >
                <div className={styles.historyHeader}>
                  <span>Recent</span>
                  <button
                    type="button"
                    className={styles.clearHistory}
                    onClick={handleHistoryClear}
                  >
                    Clear
                  </button>
                </div>
                {history.map(q => (
                  <button
                    key={q}
                    type="button"
                    className={styles.historyItem}
                    onClick={() => handleHistoryClick(q)}
                    role="option"
                  >
                    <span aria-hidden="true">🕐</span>
                    {q}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right controls — tighter gap between icon buttons */}
        <div className={styles.rightControls}>
          {/* Favorites */}
          <NavLink
            to="/favorites"
            aria-label="Favorites"
            className={({ isActive }) =>
              [
                iconBtnStyles.iconBtn,
                iconBtnStyles.iconBtnSm,
                isActive ? iconBtnStyles.iconBtnActive : '',
                styles.favLink,
              ]
                .filter(Boolean)
                .join(' ')
            }
          >
            {({ isActive }) => (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 17.5S2 12.5 2 7a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 5.5-8 10.5-8 10.5z"
                  fill={isActive ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </NavLink>

          {/* Theme toggle */}
          <IconButton
            size="sm"
            onClick={onThemeToggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ fontSize: '1rem', lineHeight: 1 }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </IconButton>

          {/* Auth */}
          {!authLoading &&
            (user ? (
              <DropdownMenu.Root modal={false}>
                <DropdownMenu.Trigger asChild>
                  <IconButton
                    size="sm"
                    className={styles.avatarBtn}
                    aria-label={`User menu for ${user.email ?? 'account'}`}
                    title={user.email ?? 'Account'}
                  >
                    {userInitial}
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className={styles.dropdownContent}
                    align="end"
                    sideOffset={6}
                  >
                    <div className={styles.dropdownUserInfo}>
                      <span className={styles.dropdownAvatar}>{userInitial}</span>
                      <div className={styles.dropdownUserDetails}>
                        {user.displayName && (
                          <span className={styles.dropdownName}>{user.displayName}</span>
                        )}
                        <span className={styles.dropdownEmail}>{user.email}</span>
                      </div>
                    </div>
                    <DropdownMenu.Separator className={styles.dropdownSeparator} />
                    <DropdownMenu.Item className={styles.dropdownItem} asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className={styles.dropdownItem} onSelect={handleSignOut}>
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <Link to="/login" className={styles.signInBtn}>
                Sign in
              </Link>
            ))}
        </div>
      </div>
    </header>
  )
}
