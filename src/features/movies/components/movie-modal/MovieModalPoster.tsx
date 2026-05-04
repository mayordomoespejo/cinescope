import { getPosterUrl } from '@/lib/helpers'
import type { Video } from '../../types/movie'
import styles from './MovieModalPoster.module.css'

interface MovieModalPosterProps {
  posterPath: string | null
  title: string
  trailer: (Video & { key: string }) | null | undefined
  trailerPlaying: boolean
  loadingVideos: boolean
  onPlay: () => void
  onPlayWhenReady: () => void
}

/**
 * Renders the poster column of the movie modal.
 *
 * Three visual states:
 * - Trailer available and not yet playing → poster wrapped in a play button.
 * - Videos still loading → poster wrapped in a "loading" button that queues
 *   playback once the trailer becomes available.
 * - No trailer (or trailer already playing) → plain poster image.
 */
export default function MovieModalPoster({
  posterPath,
  title,
  trailer,
  trailerPlaying,
  loadingVideos,
  onPlay,
  onPlayWhenReady,
}: MovieModalPosterProps) {
  const posterSrc = getPosterUrl(posterPath, 'lg')
  const alt = `${title} poster`

  if (trailer && !trailerPlaying) {
    return (
      <div className={styles.posterCol}>
        <button
          type="button"
          className={styles.posterPlayWrapper}
          onClick={onPlay}
          aria-label="Play trailer"
        >
          <img src={posterSrc} alt={alt} className={styles.poster} loading="eager" />
          <div className={styles.posterPlayOverlay} aria-hidden="true">
            <span className={styles.posterPlayIcon}>▶</span>
          </div>
        </button>
      </div>
    )
  }

  if (loadingVideos) {
    return (
      <div className={styles.posterCol}>
        <button
          type="button"
          className={styles.posterPlayWrapper}
          onClick={onPlayWhenReady}
          aria-label="Loading trailer…"
        >
          <img src={posterSrc} alt={alt} className={styles.poster} loading="eager" />
          <div className={styles.posterPlayOverlay} aria-hidden="true">
            <span className={styles.posterPlayIcon}>⋯</span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className={styles.posterCol}>
      <img src={posterSrc} alt={alt} className={styles.poster} loading="eager" />
    </div>
  )
}
