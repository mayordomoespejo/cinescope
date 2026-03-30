import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TVShow } from '../types/tv'
import { getPosterUrl, formatRating, getReleaseYear } from '@/lib/helpers'
import styles from './TVCard.module.css'

interface TVCardProps {
  show: TVShow
  /** @deprecated Pass nothing — card now navigates internally to /tv/:id */
  onOpen?: (id: number) => void
  onPrefetch?: (id: number) => void
  isFavorite?: boolean
  onToggleFavorite?: (show: TVShow) => void
}

/**
 * TV show card. Clicking navigates to /tv/:id via React Router.
 * The optional `onOpen` prop is kept for backward compatibility but the
 * internal navigate call takes precedence.
 */
export default function TVCard({
  show,
  onOpen,
  onPrefetch,
  isFavorite = false,
  onToggleFavorite,
}: TVCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/tv/${show.id}`)
    onOpen?.(show.id)
  }

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(show)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(`/tv/${show.id}`)
      onOpen?.(show.id)
    }
  }

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onMouseEnter={() => onPrefetch?.(show.id)}
      onFocus={() => onPrefetch?.(show.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${show.name}, ${getReleaseYear(show.first_air_date)}, rating ${formatRating(show.vote_average)}`}
    >
      {/* Rating badge */}
      <div className={styles.rating} aria-label={`Rating: ${formatRating(show.vote_average)}`}>
        <span className={styles.star} aria-hidden="true">
          ★
        </span>
        {formatRating(show.vote_average)}
      </div>

      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          type="button"
          className={`${styles.favBtn} ${isFavorite ? styles.favActive : ''}`}
          onClick={handleFavClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 14S1 9.5 1 5.5a3.5 3.5 0 0 1 7 0 3.5 3.5 0 0 1 7 0C15 9.5 8 14 8 14z"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Poster */}
      <div className={styles.posterWrapper}>
        {!imgLoaded && <div className={styles.posterSkeleton} aria-hidden="true" />}
        <img
          src={getPosterUrl(show.poster_path, 'md')}
          srcSet={`${getPosterUrl(show.poster_path, 'sm')} 185w, ${getPosterUrl(show.poster_path, 'md')} 342w, ${getPosterUrl(show.poster_path, 'lg')} 500w`}
          sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, 200px"
          alt={show.name}
          className={`${styles.poster} ${imgLoaded ? styles.posterLoaded : ''}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
        />
        {/* Hover overlay */}
        <div className={styles.overlay} aria-hidden="true" />
      </div>

      {/* Info */}
      <div className={styles.info}>
        <p className={styles.title}>{show.name}</p>
        <p className={styles.year}>{getReleaseYear(show.first_air_date)}</p>
      </div>
    </article>
  )
}
