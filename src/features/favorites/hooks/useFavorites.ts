import { useState, useCallback, useEffect } from 'react'
import type { Movie } from '@/features/movies/types/movie'
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  reorderFavorites,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  reorderWatchlist,
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

  const reorderFavs = useCallback((newOrder: Movie[]) => {
    reorderFavorites(newOrder)
    setFavorites(newOrder)
  }, [])

  const reorderWatch = useCallback((newOrder: Movie[]) => {
    reorderWatchlist(newOrder)
    setWatchlist(newOrder)
  }, [])

  return {
    favorites,
    watchlist,
    toggleFavorite,
    toggleWatchlist,
    isFavorite: checkFavorite,
    isInWatchlist: checkWatchlist,
    reorderFavorites: reorderFavs,
    reorderWatchlist: reorderWatch,
  }
}
