import { Outlet, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import MovieModal from '@/features/movies/components/MovieModal'
import styles from './Layout.module.css'

export default function Layout() {
  const [searchParams, setSearchParams] = useSearchParams()
  const movieId = searchParams.get('movieId')

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('cinescope:theme')
    return (stored as 'dark' | 'light') ?? 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cinescope:theme', theme)
  }, [theme])

  const handleThemeToggle = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
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
