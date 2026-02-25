import { useRef } from 'react'
import { useGenres } from '../hooks/useGenres'
import Chip from '@/components/ui/Chip'
import styles from './GenreFilter.module.css'

interface GenreFilterProps {
  selectedGenreId: number | null
  onSelect: (id: number | null) => void
}

export default function GenreFilter({ selectedGenreId, onSelect }: GenreFilterProps) {
  const { data: genres = [], isLoading } = useGenres()
  const trackRef = useRef<HTMLDivElement>(null)

  if (isLoading) {
    return (
      <div className={styles.track}>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={styles.chipSkeleton}
            style={{ width: `${60 + (i % 3) * 20}px` }}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.wrapper} role="group" aria-label="Filter by genre">
      <div className={styles.track} ref={trackRef}>
        <Chip label="All" active={selectedGenreId === null} onClick={() => onSelect(null)} />
        {genres.map(genre => (
          <Chip
            key={genre.id}
            label={genre.name}
            active={selectedGenreId === genre.id}
            onClick={() => onSelect(genre.id)}
          />
        ))}
      </div>
    </div>
  )
}
