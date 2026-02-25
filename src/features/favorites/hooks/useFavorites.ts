import { useState, useCallback, useEffect } from 'react'
import type { Movie } from '@/features/movies/types/movie'
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from '../store'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Movie[]>(getFavorites)
  const [watchlist, setWatchlist] = useState<Movie[]>(getWatchlist)

  useEffect(() => {
    const sync = () => {
      setFavorites(getFavorites())
      setWatchlist(getWatchlist())
    }
    window.addEventListener('cinescope:favorites-change', sync)
    return () => window.removeEventListener('cinescope:favorites-change', sync)
  }, [])

  const toggleFavorite = useCallback((movie: Movie) => {
    if (isFavorite(movie.id)) {
      removeFavorite(movie.id)
    } else {
      addFavorite(movie)
    }
    setFavorites(getFavorites())
  }, [])

  const toggleWatchlist = useCallback((movie: Movie) => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id)
    } else {
      addToWatchlist(movie)
    }
    setWatchlist(getWatchlist())
  }, [])

  const checkFavorite = useCallback((id: number) => isFavorite(id), [])
  const checkWatchlist = useCallback((id: number) => isInWatchlist(id), [])

  return {
    favorites,
    watchlist,
    toggleFavorite,
    toggleWatchlist,
    isFavorite: checkFavorite,
    isInWatchlist: checkWatchlist,
  }
}
