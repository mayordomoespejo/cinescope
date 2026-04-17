import { useState } from 'react'
import { getPosterUrl, getReleaseYear } from '@/lib/helpers'
import type { ListItem } from '@/features/lists/store'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import styles from './ListCard.module.css'

// ── Helpers ───────────────────────────────────────────────────────────

function isMovie(media: Movie | TVShow): media is Movie {
  return 'title' in media
}

/** Extract a display title from media_data (TMDB movie or tv shape). */
function getMediaTitle(item: ListItem): string {
  const d = item.media_data
  return isMovie(d) ? d.title : d.name
}

/** Extract a release date string from media_data. */
function getMediaDate(item: ListItem): string | null {
  const d = item.media_data
  return isMovie(d) ? (d.release_date || null) : (d.first_air_date || null)
}

/** Extract a poster_path string from media_data. */
function getMediaPoster(item: ListItem): string | null {
  return item.media_data.poster_path || null
}

// ── Types ─────────────────────────────────────────────────────────────

export interface ListCardProps {
  item: ListItem
  onRemove: () => Promise<void>
}

// ── Component ─────────────────────────────────────────────────────────

/**
 * A single media item card in the right-panel grid.
 * Shows poster, title, and year. Has a hover "×" remove button.
 */
export function ListCard({ item, onRemove }: ListCardProps) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setRemoving(true)
    try {
      await onRemove()
    } finally {
      setRemoving(false)
    }
  }

  const title = getMediaTitle(item)
  const year = getReleaseYear(getMediaDate(item))
  const posterUrl = getPosterUrl(getMediaPoster(item), 'sm')

  return (
    <div className={styles.itemCard}>
      <div className={styles.posterWrap}>
        <img className={styles.poster} src={posterUrl} alt={title} loading="lazy" />
        <button
          className={styles.removeBtn}
          onClick={handleRemove}
          disabled={removing}
          title="Remove from list"
          type="button"
          aria-label={`Remove ${title} from list`}
        >
          {removing ? '…' : '×'}
        </button>
      </div>
      <span className={styles.itemTitle}>{title}</span>
      <span className={styles.itemYear}>{year}</span>
    </div>
  )
}
