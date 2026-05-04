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
import styles from './MovieModal.module.css'

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
              ) : isLoading ? (
                <ModalSkeleton />
              ) : movie ? (
                <>
                  <MovieModalBackdrop backdropPath={movie.backdrop_path ?? null} />

                  <div className={styles.body}>
                    <MovieModalPoster
                      posterPath={movie.poster_path ?? null}
                      title={movie.title}
                      trailer={trailer}
                      trailerPlaying={trailerPlaying}
                      loadingVideos={loadingVideos}
                      onPlay={handlePlay}
                      onPlayWhenReady={handlePlayWhenReady}
                    />

                    <MovieModalDetails
                      movie={movie}
                      isFav={isFavorite}
                      inWatchlist={isInWatchlist}
                      trailer={trailer}
                      trailerPlaying={trailerPlaying}
                      loadingVideos={loadingVideos}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleWatchlist={handleToggleWatchlist}
                      onPlayTrailer={handlePlay}
                      onPlayWhenReady={handlePlayWhenReady}
                    />
                  </div>

                  {trailerPlaying && trailer && (
                    <TrailerLightbox
                      trailer={trailer}
                      movieTitle={movie.title}
                      movieId={movieId}
                      onClose={handleStopTrailer}
                    />
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
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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
