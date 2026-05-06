import { getYouTubeEmbedUrl } from '@/lib/videoUtils'
import type { Video } from '../../types/movie'
import styles from './TrailerLightbox.module.css'

interface TrailerLightboxProps {
  /** The trailer video object whose `key` is used to build the embed URL. */
  trailer: Video & { key: string }
  /** Human-readable title used for the iframe `title` attribute. */
  movieTitle: string
  /** Stable identifier used as part of the iframe `key` to force remount on change. */
  movieId: number
  /** Called when the user dismisses the lightbox (backdrop click or close button). */
  onClose: () => void
}

/**
 * Full-modal trailer overlay rendered when the user requests trailer playback.
 *
 * Clicking the backdrop dismisses the overlay; clicking inside the iframe
 * container stops propagation so the video is not accidentally closed.
 *
 * Note: this component is intentionally free of movie-specific logic so it can
 * be reused by a future TVModal without modification.
 */
export default function TrailerLightbox({
  trailer,
  movieTitle,
  movieId,
  onClose,
}: TrailerLightboxProps) {
  return (
    // Backdrop — click outside to close (keyboard dismiss via inner dialog)
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className={styles.trailerOverlay} onClick={onClose}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Trailer"
        tabIndex={-1}
        className={styles.trailerOverlayContent}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => {
          e.stopPropagation()
          if (e.key === 'Escape') onClose()
        }}
      >
        <button
          type="button"
          className={styles.trailerOverlayClose}
          onClick={onClose}
          aria-label="Close trailer"
        >
          ✕
        </button>
        <iframe
          key={`trailer-${movieId}-${trailer.key}`}
          src={getYouTubeEmbedUrl(trailer.key)}
          title={`${movieTitle} — Official Trailer`}
          className={styles.trailerOverlayIframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
