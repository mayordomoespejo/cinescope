import { useEffect, useState } from 'react'
import { useMovieDetail } from '../../hooks/useMovieDetail'
import { useMovieVideos } from '../../hooks/useMovieVideos'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import type { MovieDetail, Video } from '../../types/movie'

/** Resolved trailer: a Video guaranteed to have a non-empty key. */
export type Trailer = Video & { key: string }

/** Full state and handlers returned by {@link useMovieModalState}. */
export interface MovieModalState {
  /** Full movie detail object, or `undefined` while loading / on error. */
  movie: MovieDetail | undefined
  /** True while the movie detail request is in-flight. */
  isLoading: boolean
  /** Non-null when the movie detail fetch failed. */
  error: Error | null
  /** Best YouTube trailer for this movie, or `null`/`undefined` when unavailable. */
  trailer: Trailer | null | undefined
  /** True while the videos list is still loading. */
  loadingVideos: boolean
  /** True when the trailer lightbox is open and playing. */
  trailerPlaying: boolean
  /**
   * True when the user clicked "Play" before videos finished loading.
   * The trailer will auto-start as soon as the video data arrives.
   */
  playWhenReady: boolean
  /** Whether the movie is in the user's favorites list. */
  isFavorite: boolean
  /** Whether the movie is in the user's watchlist. */
  isInWatchlist: boolean
  /** Start playing the trailer immediately (video data is already available). */
  handlePlay: () => void
  /** Stop the trailer and close the lightbox. */
  handleStopTrailer: () => void
  /** Queue trailer playback to start as soon as video data loads. */
  handlePlayWhenReady: () => void
  /** Toggle the movie in/out of the user's favorites. */
  handleToggleFavorite: () => void
  /** Toggle the movie in/out of the user's watchlist. */
  handleToggleWatchlist: () => void
}

/**
 * Encapsulates all data-fetching and trailer-playback logic for the movie modal.
 *
 * @param movieId - TMDB ID of the movie to load.
 * @returns See {@link MovieModalState}.
 */
export function useMovieModalState(movieId: number): MovieModalState {
  const { data: movie, isLoading, error } = useMovieDetail(movieId)
  const { data: videos, isLoading: loadingVideos } = useMovieVideos(movieId)
  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useFavorites()

  const [trailerPlaying, setTrailerPlaying] = useState(false)
  const [playWhenReady, setPlayWhenReady] = useState(false)

  const trailer = videos?.trailer

  // When user clicked play while videos were loading, start trailer once it's available.
  // Defer setState to avoid synchronous setState in effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (playWhenReady && trailer && !trailerPlaying) {
      queueMicrotask(() => {
        setTrailerPlaying(true)
        setPlayWhenReady(false)
      })
    }
    // Videos finished loading but no trailer found — reset play state to avoid a stuck spinner.
    if (!loadingVideos && !videos?.results?.length) {
      const t = setTimeout(() => {
        setPlayWhenReady(false)
        setTrailerPlaying(false)
      }, 0)
      return () => clearTimeout(t)
    }
  }, [loadingVideos, videos, playWhenReady, trailer, trailerPlaying])

  const handlePlay = () => setTrailerPlaying(true)
  const handleStopTrailer = () => setTrailerPlaying(false)
  const handlePlayWhenReady = () => setPlayWhenReady(true)

  const handleToggleFavorite = () => {
    if (!movie) return
    toggleFavorite({ ...movie, genre_ids: movie.genres.map(g => g.id) })
  }

  const handleToggleWatchlist = () => {
    if (!movie) return
    toggleWatchlist({ ...movie, genre_ids: movie.genres.map(g => g.id) })
  }

  return {
    movie,
    isLoading,
    error: error ?? null,
    trailer,
    loadingVideos,
    trailerPlaying,
    playWhenReady,
    isFavorite: movie ? isFavorite(movie.id) : false,
    isInWatchlist: movie ? isInWatchlist(movie.id) : false,
    handlePlay,
    handleStopTrailer,
    handlePlayWhenReady,
    handleToggleFavorite,
    handleToggleWatchlist,
  }
}
