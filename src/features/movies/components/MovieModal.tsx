import { useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { motion, AnimatePresence } from 'framer-motion'
import { useMovieModalState } from './movie-modal/useMovieModalState'
import MovieModalBackdrop from './movie-modal/MovieModalBackdrop'
import MovieModalPoster from './movie-modal/MovieModalPoster'
import MovieModalDetails from './movie-modal/MovieModalDetails'
import TrailerLightbox from './movie-modal/TrailerLightbox'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import type { MovieDetail, Video } from '../types/movie'
import styles from './MovieModal.module.css'

// ── MovieModalContent ─────────────────────────────────────────────────

interface MovieModalContentProps {
  isLoading: boolean
  movie: MovieDetail | undefined
  movieId: number
  trailer: Video | null | undefined
  trailerPlaying: boolean
  loadingVideos: boolean
  isFavorite: boolean
  isInWatchlist: boolean
  onPlay: () => void
  onPlayWhenReady: () => void
  onStopTrailer: () => void
  onToggleFavorite: () => void
  onToggleWatchlist: () => void
}

function MovieModalContent({
  isLoading,
  movie,
  movieId,
  trailer,
  trailerPlaying,
  loadingVideos,
  isFavorite,
  isInWatchlist,
  onPlay,
  onPlayWhenReady,
  onStopTrailer,
  onToggleFavorite,
  onToggleWatchlist,
}: MovieModalContentProps) {
  if (isLoading) return <ModalSkeleton />
  if (!movie) return null

  return (
    <>
      <MovieModalBackdrop backdropPath={movie.backdrop_path ?? null} />

      <div className={styles.body}>
        <MovieModalPoster
          posterPath={movie.poster_path ?? null}
          title={movie.title}
          trailer={trailer}
          trailerPlaying={trailerPlaying}
          loadingVideos={loadingVideos}
          onPlay={onPlay}
          onPlayWhenReady={onPlayWhenReady}
        />

        <MovieModalDetails
          movie={movie}
          isFav={isFavorite}
          inWatchlist={isInWatchlist}
          trailer={trailer}
          trailerPlaying={trailerPlaying}
          loadingVideos={loadingVideos}
          onToggleFavorite={onToggleFavorite}
          onToggleWatchlist={onToggleWatchlist}
          onPlayTrailer={onPlay}
          onPlayWhenReady={onPlayWhenReady}
        />
      </div>

      {trailerPlaying && trailer && (
        <TrailerLightbox
          trailer={trailer}
          movieTitle={movie.title}
          movieId={movieId}
          onClose={onStopTrailer}
        />
      )}
    </>
  )
}

/** Props for the MovieModal component. */
interface MovieModalProps {
  movieId: number
  onClose: () => void
}

/**
 * @description Accessible modal dialog showing full movie details: backdrop, poster, trailer, genres, overview, cast actions, and favorites/watchlist toggles.
 * @param props - Component props
 */
export default function MovieModal({ movieId, onClose }: MovieModalProps) {
  const {
    movie,
    isLoading,
    error,
    trailer,
    loadingVideos,
    trailerPlaying,
    isFavorite,
    isInWatchlist,
    handlePlay,
    handleStopTrailer,
    handlePlayWhenReady,
    handleToggleFavorite,
    handleToggleWatchlist,
  } = useMovieModalState(movieId)

  const closeRef = useRef<HTMLButtonElement>(null)

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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              ) : (
                <MovieModalContent
                  isLoading={isLoading}
                  movie={movie}
                  movieId={movieId}
                  trailer={trailer}
                  trailerPlaying={trailerPlaying}
                  loadingVideos={loadingVideos}
                  isFavorite={isFavorite}
                  isInWatchlist={isInWatchlist}
                  onPlay={handlePlay}
                  onPlayWhenReady={handlePlayWhenReady}
                  onStopTrailer={handleStopTrailer}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              )}
            </motion.div>
          </Dialog.Content>
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ModalSkeleton() {
  return (
    <>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.backdropGradient} />
      </div>
      <div className={styles.body}>
        <div className={styles.posterCol}>
          <div className={styles.skeletonPoster} aria-hidden="true" />
        </div>
        <div className={styles.details}>
          <Skeleton height="2rem" width="70%" />
          <Skeleton height="0.9rem" width="45%" />
          <div className={styles.actionRow}>
            {[80, 70, 60].map(w => (
              <Skeleton
                key={w}
                height="1.5rem"
                width={`${w}px`}
                borderRadius="var(--radius-full)"
              />
            ))}
          </div>
          <Skeleton height="0.875rem" width="100%" />
          <Skeleton height="0.875rem" width="90%" />
          <Skeleton height="0.875rem" width="80%" />
        </div>
      </div>
    </>
  )
}
