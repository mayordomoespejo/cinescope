import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { motion, AnimatePresence } from 'framer-motion'
import { useMovieDetail } from '../hooks/useMovieDetail'
import { useMovieVideos } from '../hooks/useMovieVideos'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import {
  getPosterUrl,
  getBackdropUrl,
  formatRating,
  formatDate,
  formatRuntime,
  formatMoney,
  getYouTubeEmbedUrl,
} from '@/lib/helpers'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import styles from './MovieModal.module.css'

interface MovieModalProps {
  movieId: number
  onClose: () => void
}

export default function MovieModal({ movieId, onClose }: MovieModalProps) {
  const { data: movie, isLoading: loadingDetail, error } = useMovieDetail(movieId)
  const { data: videos, isLoading: loadingVideos } = useMovieVideos(movieId)
  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useFavorites()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const [trailerPlaying, setTrailerPlaying] = useState(false)
  const [playWhenReady, setPlayWhenReady] = useState(false)
  const trailer = videos?.trailer
  const isFav = movie ? isFavorite(movie.id) : false
  const inWatchlist = movie ? isInWatchlist(movie.id) : false

  // When user clicked play while videos were loading, start trailer once it's available.
  // Defer setState to avoid synchronous setState in effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (playWhenReady && trailer && !trailerPlaying) {
      queueMicrotask(() => {
        setTrailerPlaying(true)
        setPlayWhenReady(false)
      })
    }
  }, [playWhenReady, trailer, trailerPlaying])

  return (
    <Dialog.Root open onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <AnimatePresence>
          <Dialog.Overlay asChild>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />
          </Dialog.Overlay>

          <Dialog.Content
            className={styles.content}
            onInteractOutside={onClose}
            onEscapeKeyDown={onClose}
            aria-describedby={movie ? `movie-overview-${movieId}` : undefined}
          >
            <VisuallyHidden asChild>
              <Dialog.Title>{movie?.title ?? 'Movie Details'}</Dialog.Title>
            </VisuallyHidden>

            <motion.div
              className={styles.inner}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Close button */}
              <Dialog.Close asChild>
                <button
                  ref={closeRef}
                  className={styles.closeBtn}
                  aria-label="Close movie details"
                  onClick={onClose}
                >
                  ✕
                </button>
              </Dialog.Close>

              {error ? (
                <div className={styles.errorState} role="alert">
                  <span>⚠️</span>
                  <p>Failed to load movie details</p>
                  <Button variant="secondary" size="sm" onClick={onClose}>
                    Close
                  </Button>
                </div>
              ) : loadingDetail ? (
                <ModalSkeleton />
              ) : movie ? (
                <>
                  {/* Backdrop header */}
                  <div className={styles.backdrop}>
                    {movie.backdrop_path && (
                      <img
                        src={getBackdropUrl(movie.backdrop_path, 'lg')}
                        alt=""
                        className={styles.backdropImg}
                        loading="eager"
                      />
                    )}
                    <div className={styles.backdropGradient} aria-hidden="true" />
                  </div>

                  {/* Body */}
                  <div className={styles.body}>
                    {/* Poster: clickable to play trailer when available or while videos load */}
                    <div className={styles.posterCol}>
                      {trailer && !trailerPlaying ? (
                        <button
                          type="button"
                          className={styles.posterPlayWrapper}
                          onClick={() => setTrailerPlaying(true)}
                          aria-label="Play trailer"
                        >
                          <img
                            src={getPosterUrl(movie.poster_path, 'lg')}
                            alt={`${movie.title} poster`}
                            className={styles.poster}
                            loading="eager"
                          />
                          <div className={styles.posterPlayOverlay} aria-hidden="true">
                            <span className={styles.posterPlayIcon}>▶</span>
                          </div>
                        </button>
                      ) : loadingVideos ? (
                        <button
                          type="button"
                          className={styles.posterPlayWrapper}
                          onClick={() => setPlayWhenReady(true)}
                          aria-label="Loading trailer…"
                        >
                          <img
                            src={getPosterUrl(movie.poster_path, 'lg')}
                            alt={`${movie.title} poster`}
                            className={styles.poster}
                            loading="eager"
                          />
                          <div className={styles.posterPlayOverlay} aria-hidden="true">
                            <span className={styles.posterPlayIcon}>⋯</span>
                          </div>
                        </button>
                      ) : (
                        <img
                          src={getPosterUrl(movie.poster_path, 'lg')}
                          alt={`${movie.title} poster`}
                          className={styles.poster}
                          loading="eager"
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className={styles.details}>
                      {/* Title + tagline */}
                      <div className={styles.titleGroup}>
                        <h2 className={styles.title}>{movie.title}</h2>
                        {movie.tagline && <p className={styles.tagline}>"{movie.tagline}"</p>}
                      </div>

                      {/* Stats row */}
                      <div className={styles.stats}>
                        <span
                          className={styles.rating}
                          aria-label={`Rating: ${formatRating(movie.vote_average)} out of 10`}
                        >
                          <span aria-hidden="true">★</span> {formatRating(movie.vote_average)}
                          <span className={styles.voteCount}>
                            ({movie.vote_count.toLocaleString()})
                          </span>
                        </span>
                        <span className={styles.stat}>{formatDate(movie.release_date)}</span>
                        {movie.runtime && (
                          <span className={styles.stat}>{formatRuntime(movie.runtime)}</span>
                        )}
                        {movie.original_language && (
                          <span className={styles.stat}>
                            {movie.original_language.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Genres */}
                      {movie.genres.length > 0 && (
                        <div className={styles.genres} aria-label="Genres">
                          {movie.genres.map(g => (
                            <span key={g.id} className={styles.genre}>
                              {g.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Overview */}
                      <p className={styles.overview} id={`movie-overview-${movieId}`}>
                        {movie.overview || 'No overview available.'}
                      </p>

                      {/* Extra info */}
                      <div className={styles.extraInfo}>
                        {movie.budget > 0 && (
                          <div className={styles.extraItem}>
                            <span className={styles.extraLabel}>Budget</span>
                            <span>{formatMoney(movie.budget)}</span>
                          </div>
                        )}
                        {movie.revenue > 0 && (
                          <div className={styles.extraItem}>
                            <span className={styles.extraLabel}>Revenue</span>
                            <span>{formatMoney(movie.revenue)}</span>
                          </div>
                        )}
                        {movie.status && (
                          <div className={styles.extraItem}>
                            <span className={styles.extraLabel}>Status</span>
                            <span>{movie.status}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className={styles.actions}>
                        {/* Favorite */}
                        <Button
                          variant={isFav ? 'danger' : 'secondary'}
                          size="md"
                          onClick={() =>
                            toggleFavorite({ ...movie, genre_ids: movie.genres.map(g => g.id) })
                          }
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          aria-pressed={isFav}
                        >
                          <span style={{ display: 'inline-grid' }}>
                            <span
                              style={{ gridArea: '1/1', visibility: isFav ? 'visible' : 'hidden' }}
                            >
                              ❤️ Favorited
                            </span>
                            <span
                              style={{ gridArea: '1/1', visibility: isFav ? 'hidden' : 'visible' }}
                            >
                              🤍 Favorite
                            </span>
                          </span>
                        </Button>

                        {/* Watchlist */}
                        <Button
                          variant="ghost"
                          size="md"
                          onClick={() =>
                            toggleWatchlist({ ...movie, genre_ids: movie.genres.map(g => g.id) })
                          }
                          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                          aria-pressed={inWatchlist}
                        >
                          {inWatchlist ? '✓ Watchlist' : '+ Watchlist'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Trailer lightbox — overlays the whole modal */}
                  {trailerPlaying && trailer && (
                    <div
                      className={styles.trailerOverlay}
                      onClick={() => setTrailerPlaying(false)}
                      aria-modal="true"
                      role="dialog"
                      aria-label="Trailer"
                    >
                      <button
                        type="button"
                        className={styles.trailerOverlayClose}
                        onClick={() => setTrailerPlaying(false)}
                        aria-label="Close trailer"
                      >
                        ✕
                      </button>
                      <div
                        className={styles.trailerOverlayContent}
                        onClick={e => e.stopPropagation()}
                      >
                        <iframe
                          key={`trailer-${movieId}-${trailer.key}`}
                          src={getYouTubeEmbedUrl(trailer.key)}
                          title={`${movie.title} — Official Trailer`}
                          className={styles.trailerOverlayIframe}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>
          </Dialog.Content>
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ModalSkeleton() {
  return (
    <div className={styles.body} style={{ marginTop: '1rem' }}>
      <div className={styles.posterCol}>
        <div className={styles.skeletonPoster} aria-hidden="true" />
      </div>
      <div className={styles.details}>
        <Skeleton height="2rem" width="70%" />
        <Skeleton height="0.9rem" width="45%" />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {[80, 70, 60].map(w => (
            <Skeleton key={w} height="1.5rem" width={`${w}px`} borderRadius="var(--radius-full)" />
          ))}
        </div>
        <Skeleton height="0.875rem" width="100%" />
        <Skeleton height="0.875rem" width="90%" />
        <Skeleton height="0.875rem" width="80%" />
      </div>
    </div>
  )
}
