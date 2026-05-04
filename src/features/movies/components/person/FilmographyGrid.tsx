import { getReleaseYear } from '@/lib/helpers'
import { MiniPosterCard } from './MiniPosterCard'
import pageStyles from '@/pages/PersonPage.module.css'
import styles from './FilmographyGrid.module.css'

export interface FilmographyGridProps<
  T extends { id: number; title: string; poster_path: string | null; release_date: string },
> {
  credits: T[]
  subtitle: (credit: T) => string
  onMovieClick: (id: number) => void
}

/** Grid of poster cards for a filmography tab */
export function FilmographyGrid<
  T extends { id: number; title: string; poster_path: string | null; release_date: string },
>({ credits, subtitle, onMovieClick }: FilmographyGridProps<T>) {
  if (credits.length === 0) {
    return <p className={pageStyles.emptyState}>No credits in this category.</p>
  }

  return (
    <div className={styles.filmographyGrid}>
      {credits.map((credit, idx) => (
        <MiniPosterCard
          key={`${credit.id}-${idx}`}
          id={credit.id}
          title={credit.title}
          posterPath={credit.poster_path}
          releaseDate={credit.release_date}
          subtitle={`${subtitle(credit)}${credit.release_date ? ` · ${getReleaseYear(credit.release_date)}` : ''}`}
          onClick={onMovieClick}
        />
      ))}
    </div>
  )
}
