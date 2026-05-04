import { useState } from 'react'
import { getPosterUrl, formatRating } from '@/lib/helpers'
import styles from './MediaCard.module.css'

/** Shared props for the internal MediaCard primitive. */
export interface MediaCardProps {
  title: string
  year: string
  posterPath: string | null
  rating?: number
  isFavorite: boolean
  onToggleFavorite?: () => void
  onClick: () => void
  onPrefetch?: () => void
  ariaLabel?: string
  /** Optional drag handle rendered inside the poster wrapper (used by SortableMovieGrid). */
  dragHandle?: React.ReactNode
}

/**
 * Shared card UI primitive used by MovieCard and TVCard.
 * Renders a poster, rating badge, and favourite toggle — all visual logic lives here.
 * Navigation / data-fetching concerns stay in the domain-specific wrappers.
 */
export default function MediaCard({
  title,
  year,
  posterPath,
  rating,
  isFavorite,
  onToggleFavorite,
  onClick,
  onPrefetch,
  ariaLabel,
  dragHandle,
}: MediaCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  const label =
    ariaLabel ?? `${title}, ${year}${rating != null ? `, rating ${formatRating(rating)}` : ''}`

  return (
    <article
      className={styles.card}
      onClick={onClick}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={label}
    >
      {/* Rating badge */}
      {rating != null && (
        <div className={styles.rating} aria-label={`Rating: ${formatRating(rating)}`}>
          <span className={styles.star} aria-hidden="true">
            ★
          </span>
          {formatRating(rating)}
        </div>
      )}

      {/* Favourite button */}
      {onToggleFavorite && (
        <button
          type="button"
          className={`${styles.favBtn} ${isFavorite ? styles.favActive : ''}`}
          onClick={handleFavClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 14S1 9.5 1 5.5a3.5 3.5 0 0 1 7 0 3.5 3.5 0 0 1 7 0C15 9.5 8 14 8 14z"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Poster */}
      <div className={styles.posterWrapper}>
        {!imgLoaded && <div className={styles.posterSkeleton} aria-hidden="true" />}
        <img
          src={getPosterUrl(posterPath, 'md')}
          srcSet={`${getPosterUrl(posterPath, 'sm')} 185w, ${getPosterUrl(posterPath, 'md')} 342w, ${getPosterUrl(posterPath, 'lg')} 500w`}
          sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, 200px"
          alt={title}
          className={`${styles.poster} ${imgLoaded ? styles.posterLoaded : ''}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
        />
        {/* Hover overlay */}
        <div className={styles.overlay} aria-hidden="true" />
        {dragHandle}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        <p className={styles.year}>{year}</p>
      </div>
    </article>
  )
}
