import { useState } from 'react'
import type { Movie } from '../types/movie'
import { getPosterUrl, formatRating, getReleaseYear } from '@/lib/helpers'
import styles from './MovieCard.module.css'

interface MovieCardProps {
  movie: Movie
  onOpen: (id: number) => void
  onPrefetch?: (id: number) => void
  isFavorite?: boolean
  onToggleFavorite?: (movie: Movie) => void
  dragHandle?: React.ReactNode
}

export default function MovieCard({
  movie,
  onOpen,
  onPrefetch,
  isFavorite = false,
  onToggleFavorite,
  dragHandle,
}: MovieCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  const handleClick = () => onOpen(movie.id)

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(movie)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(movie.id)
    }
  }

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onMouseEnter={() => onPrefetch?.(movie.id)}
      onFocus={() => onPrefetch?.(movie.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${movie.title}, ${getReleaseYear(movie.release_date)}, rating ${formatRating(movie.vote_average)}`}
    >
      {/* Rating badge */}
      <div className={styles.rating} aria-label={`Rating: ${formatRating(movie.vote_average)}`}>
        <span className={styles.star} aria-hidden="true">
          ★
        </span>
        {formatRating(movie.vote_average)}
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
          {isFavorite ? '❤️' : '🤍'}
        </button>
      )}

      {/* Poster */}
      <div className={styles.posterWrapper}>
        {!imgLoaded && <div className={styles.posterSkeleton} aria-hidden="true" />}
        <img
          src={getPosterUrl(movie.poster_path, 'md')}
          srcSet={`${getPosterUrl(movie.poster_path, 'sm')} 185w, ${getPosterUrl(movie.poster_path, 'md')} 342w, ${getPosterUrl(movie.poster_path, 'lg')} 500w`}
          sizes="(max-width: 480px) 140px, (max-width: 768px) 160px, 200px"
          alt={movie.title}
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
        <p className={styles.title}>{movie.title}</p>
        <p className={styles.year}>{getReleaseYear(movie.release_date)}</p>
      </div>
    </article>
  )
}
