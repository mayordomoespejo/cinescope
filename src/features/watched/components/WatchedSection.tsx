import type { WatchedItem } from '@/features/watched/store'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import { getPosterUrl, formatDate } from '@/lib/helpers'
import styles from './WatchedSection.module.css'

function getMediaTitle(mediaData: Movie | TVShow | undefined): string {
  if (!mediaData) return 'Unknown'
  if ('title' in mediaData) return mediaData.title
  return mediaData.name
}

function getMediaPosterPath(mediaData: Movie | TVShow | undefined): string | null {
  return mediaData?.poster_path ?? null
}

interface WatchedCardProps {
  item: WatchedItem
  onRemove: (item: WatchedItem) => void
  onNavigate: (mediaType: string, mediaId: number) => void
}

function WatchedCard({ item, onRemove, onNavigate }: WatchedCardProps) {
  const title = getMediaTitle(item.media_data)
  const posterPath = getMediaPosterPath(item.media_data)

  function handleCardClick() {
    onNavigate(item.media_type, item.media_id)
  }

  function handleRemoveClick(e: React.MouseEvent) {
    e.stopPropagation()
    onRemove(item)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.card} ${styles.cursorPointer}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.posterWrap}>
        <img
          src={getPosterUrl(posterPath, 'sm')}
          alt={title}
          className={styles.poster}
          loading="lazy"
        />
        <button
          className={styles.trashBtn}
          onClick={handleRemoveClick}
          aria-label={`Remove ${title} from watch history`}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardTitle}>{title}</p>
        <p className={`${styles.cardMeta} ${styles.metaAuto}`}>{formatDate(item.watched_at)}</p>
      </div>
    </div>
  )
}

interface WatchedContentProps {
  items: WatchedItem[]
  onRemove: (item: WatchedItem) => void
  onNavigate: (mediaType: string, mediaId: number) => void
}

function WatchedContent({ items, onRemove, onNavigate }: WatchedContentProps) {
  if (items.length === 0) {
    return <p className={styles.emptyState}>Nothing watched yet. Start exploring!</p>
  }
  return (
    <div className={styles.grid}>
      {items.map(item => (
        <WatchedCard
          key={`${item.media_type}-${item.media_id}`}
          item={item}
          onRemove={onRemove}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}

interface WatchedSectionProps {
  items: WatchedItem[]
  onRemove: (item: WatchedItem) => void
  onNavigate: (mediaType: string, mediaId: number) => void
}

export function WatchedSection({ items, onRemove, onNavigate }: WatchedSectionProps) {
  return (
    <section aria-labelledby="watch-history-heading">
      <h2 className={styles.sectionHeading} id="watch-history-heading">
        Watch History
      </h2>
      <WatchedContent items={items} onRemove={onRemove} onNavigate={onNavigate} />
    </section>
  )
}
