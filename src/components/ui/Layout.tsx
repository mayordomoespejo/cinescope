import { Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from './navbar/Navbar'
import BottomNav from './BottomNav'
import ScrollToTop from './ScrollToTop'
import { STORAGE_KEYS } from '@/lib/constants'
import styles from './Layout.module.css'

/**
 * @description Root layout component. Manages theme (dark/light), renders the Navbar, and the outlet for child routes.
 */
export default function Layout() {
  const navigate = useNavigate()

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Track whether the user has manually overridden the theme
  const manualOverride = useRef(localStorage.getItem(STORAGE_KEYS.THEME) !== null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // Only persist when user has manually overridden (manualOverride.current is set in handleThemeToggle)
  }, [theme])

  // Listen to system theme changes and follow them unless user has overridden
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!manualOverride.current) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  const handleThemeToggle = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      manualOverride.current = true
      localStorage.setItem(STORAGE_KEYS.THEME, next)
      return next
    })
  }

  const handleOpenMovie = (id: number) => {
    navigate(`/movie/${id}`)
  }

  return (
    <div className={styles.root}>
      <ScrollToTop />
      <Navbar theme={theme} onThemeToggle={handleThemeToggle} />
      <main className={styles.main} id="main-content">
        <Outlet context={{ onOpenMovie: handleOpenMovie }} />
      </main>
      <BottomNav />
    </div>
  )
}
