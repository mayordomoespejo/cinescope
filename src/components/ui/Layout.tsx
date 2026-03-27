import { Outlet, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from './Navbar'
import MovieModal from '@/features/movies/components/MovieModal'
import { useMovieDetail } from '@/features/movies/hooks/useMovieDetail'
import { useMetaTags } from '@/features/movies/hooks/useMetaTags'
import styles from './Layout.module.css'

/**
 * @description Root layout component. Manages theme (dark/light), renders the Navbar, the outlet for child routes, and the global MovieModal driven by the `?movieId` URL param.
 */
export default function Layout() {
  const [searchParams, setSearchParams] = useSearchParams()
  const movieId = searchParams.get('movieId')

  const { data: movieDetail } = useMovieDetail(movieId ? Number(movieId) : null)
  useMetaTags(movieDetail)

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('cinescope:theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  // Track whether the user has manually overridden the theme
  const manualOverride = useRef(localStorage.getItem('cinescope:theme') !== null)

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
      localStorage.setItem('cinescope:theme', next)
      return next
    })
  }

  const handleModalClose = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('movieId')
    setSearchParams(next, { replace: true })
  }

  const handleOpenMovie = (id: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('movieId', String(id))
    setSearchParams(next, { replace: true })
  }

  return (
    <div className={styles.root}>
      <Navbar theme={theme} onThemeToggle={handleThemeToggle} />
      <main className={styles.main} id="main-content">
        <Outlet context={{ onOpenMovie: handleOpenMovie }} />
      </main>

      {movieId && <MovieModal key={movieId} movieId={Number(movieId)} onClose={handleModalClose} />}
    </div>
  )
}
