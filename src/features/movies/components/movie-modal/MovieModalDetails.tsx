import { formatRating, formatDate, formatRuntime, formatMoney } from '@/lib/helpers'
import Button from '@/components/ui/Button'
import type { MovieDetail, Video } from '../../types/movie'
import styles from './MovieModalDetails.module.css'

interface MovieModalDetailsProps {
  movie: MovieDetail
  isFav: boolean
  inWatchlist: boolean
  trailer: (Video & { key: string }) | null | undefined
  trailerPlaying: boolean
  loadingVideos: boolean
  onToggleFavorite: () => void
  onToggleWatchlist: () => void
  onPlayTrailer: () => void
  onPlayWhenReady: () => void
}

/**
 * Renders the details column of the movie modal: title, tagline, stats row,
 * genre chips, overview, optional budget/revenue/status, and action buttons.
 */
export default function MovieModalDetails({
  movie,
  isFav,
  inWatchlist,
  trailer,
  trailerPlaying,
  loadingVideos,
  onToggleFavorite,
  onToggleWatchlist,
  onPlayTrailer,
  onPlayWhenReady,
}: MovieModalDetailsProps) {
  return (
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
          <span className={styles.voteCount}>({movie.vote_count.toLocaleString()})</span>
        </span>
        <span className={styles.stat}>{formatDate(movie.release_date)}</span>
        {movie.runtime && <span className={styles.stat}>{formatRuntime(movie.runtime)}</span>}
        {movie.original_language && (
          <span className={styles.stat}>{movie.original_language.toUpperCase()}</span>
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
      <p className={styles.overview} id={`movie-overview-${movie.id}`}>
        {movie.overview || 'No overview available.'}
      </p>

      {/* Extra info */}
      {(movie.budget > 0 || movie.revenue > 0 || !!movie.status) && (
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
      )}

      {/* Actions */}
      <div className={styles.actions}>
        {/* Favorite */}
        <Button
          variant={isFav ? 'danger' : 'secondary'}
          size="md"
          onClick={onToggleFavorite}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFav}
        >
          <span className={styles.labelStack}>
            <span className={isFav ? styles.labelVisible : styles.labelHidden}>❤️ Favorited</span>
            <span className={isFav ? styles.labelHidden : styles.labelVisible}>🤍 Favorite</span>
          </span>
        </Button>

        {/* Watchlist */}
        <Button
          variant="ghost"
          size="md"
          onClick={onToggleWatchlist}
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          aria-pressed={inWatchlist}
        >
          {inWatchlist ? '✓ Watchlist' : '+ Watchlist'}
        </Button>

        {/* Trailer button — only visible on mobile (poster column is hidden) */}
        {(trailer || loadingVideos) && !trailerPlaying && (
          <div className={styles.trailerMobileBtn}>
            <Button
              variant="ghost"
              size="md"
              onClick={() => (trailer ? onPlayTrailer() : onPlayWhenReady())}
              disabled={loadingVideos && !trailer}
              aria-label={trailer ? 'Watch trailer' : 'Loading trailer'}
            >
              {loadingVideos && !trailer ? '⋯ Trailer' : '▶ Trailer'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
