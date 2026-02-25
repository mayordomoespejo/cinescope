import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Navbar.module.css'
import { DEBOUNCE_DELAY } from '@/lib/config'
import { addSearchQuery, getSearchHistory, clearSearchHistory } from '@/features/favorites/store'

interface NavbarProps {
  theme: 'dark' | 'light'
  onThemeToggle: () => void
}

export default function Navbar({ theme, onThemeToggle }: NavbarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [focused, setFocused] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [scrolled, setScrolled] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // "/" shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (val.trim()) {
        navigate(`/?q=${encodeURIComponent(val.trim())}`, { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }, DEBOUNCE_DELAY)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      addSearchQuery(query.trim())
      navigate(`/?q=${encodeURIComponent(query.trim())}`)
    }
    inputRef.current?.blur()
  }

  const handleFocus = () => {
    setHistory(getSearchHistory())
    setFocused(true)
  }

  const handleBlur = () => {
    setTimeout(() => setFocused(false), 150)
  }

  const handleHistoryClick = (q: string) => {
    setQuery(q)
    navigate(`/?q=${encodeURIComponent(q)}`)
    setFocused(false)
  }

  const handleClear = () => {
    setQuery('')
    navigate('/', { replace: true })
    inputRef.current?.focus()
  }

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <div className={styles.inner}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo} aria-label="CineScope Home">
          <span className={styles.logoIcon}>🎬</span>
          <span className={styles.logoText}>CineScope</span>
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
            to="/favorites"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Favorites
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
              placeholder={'Search movies… ("/" to focus)'}
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
                    onClick={() => {
                      clearSearchHistory()
                      setHistory([])
                    }}
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

        {/* Mobile nav shortcut: home↔favorites toggle */}
        {pathname === '/favorites' ? (
          <NavLink to="/" className={styles.mobileFavBtn} aria-label="Home">
            🏠
          </NavLink>
        ) : (
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `${styles.mobileFavBtn} ${isActive ? styles.mobileFavActive : ''}`
            }
            aria-label="Favorites"
          >
            ❤️
          </NavLink>
        )}

        {/* Theme toggle */}
        <button
          type="button"
          className={styles.themeBtn}
          onClick={onThemeToggle}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
