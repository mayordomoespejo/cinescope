import { useGenres } from '../hooks/useGenres'
import Chip from '@/components/ui/Chip'
import styles from './GenreFilter.module.css'

/** Props for the GenreFilter component. */
interface GenreFilterProps {
  selectedGenreId: number | null
  onSelect: (id: number | null) => void
}

/**
 * @description Wrapping chip list for filtering content by genre. Shows skeleton chips while loading.
 * @param props - Component props
 */
export default function GenreFilter({ selectedGenreId, onSelect }: GenreFilterProps) {
  const { data: genres = [], isLoading } = useGenres()

  if (isLoading) {
    return (
      <div className={styles.track} aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={styles.chipSkeleton} style={{ width: `${60 + (i % 3) * 20}px` }} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.track} role="group" aria-label="Filter by genre">
      <Chip label="All" size="sm" active={selectedGenreId === null} onClick={() => onSelect(null)} />
      {genres.map(genre => (
        <Chip
          key={genre.id}
          label={genre.name}
          size="sm"
          active={selectedGenreId === genre.id}
          onClick={() => onSelect(genre.id)}
        />
      ))}
    </div>
  )
}
