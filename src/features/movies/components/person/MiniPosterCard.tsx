import { useState } from 'react'
import { getPosterUrl, getReleaseYear } from '@/lib/helpers'
import styles from './MiniPosterCard.module.css'

export interface MiniPosterCardProps {
  id: number
  title: string
  posterPath: string | null
  releaseDate: string
  subtitle?: string
  onClick: (id: number) => void
}

/** Mini poster card for "Known For" carousel and filmography grids */
export function MiniPosterCard({
  id,
  title,
  posterPath,
  releaseDate,
  subtitle,
  onClick,
}: MiniPosterCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <article
      className={styles.miniCard}
      onClick={() => onClick(id)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(id)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${title}, ${getReleaseYear(releaseDate)}`}
    >
      <div className={styles.miniPosterWrapper}>
        {!imgLoaded && <div className={styles.miniPosterSkeleton} aria-hidden="true" />}
        <img
          src={getPosterUrl(posterPath, 'sm')}
          alt={title}
          className={`${styles.miniPoster} ${imgLoaded ? styles.miniPosterLoaded : ''}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
        />
      </div>
      <p className={styles.miniCardTitle}>{title}</p>
      {subtitle && <p className={styles.miniCardSub}>{subtitle}</p>}
    </article>
  )
}
