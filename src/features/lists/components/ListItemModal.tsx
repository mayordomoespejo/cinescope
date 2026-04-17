import { useState } from 'react'
import type { CinescopeList, ListItem } from '../store'
import { getPosterUrl, getReleaseYear } from '@/lib/helpers'
import styles from '@/pages/ListsPage.module.css'

// ── Helpers ──────────────────────────────────────────────────────────

function getMediaTitle(item: ListItem): string {
  const d = item.media_data
  return (d.title as string) || (d.name as string) || 'Untitled'
}

function getMediaDate(item: ListItem): string | null {
  const d = item.media_data
  return (d.release_date as string) || (d.first_air_date as string) || null
}

function getMediaPoster(item: ListItem): string | null {
  return (item.media_data.poster_path as string) || null
}

// ── ItemCard ─────────────────────────────────────────────────────────

interface ItemCardProps {
  item: ListItem
  onRemove: () => Promise<void>
}

/**
 * A single media item card in the right-panel grid.
 * Shows poster, title and year. Has a hover "×" remove button.
 */
function ItemCard({ item, onRemove }: ItemCardProps) {
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

// ── ListItemModal ────────────────────────────────────────────────────

export interface ListItemModalProps {
  selectedList: CinescopeList | null
  selectedItems: ListItem[] | null
  itemsLoading: boolean
  onRemoveItem: (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => Promise<void>
}

/**
 * Right-panel content: shows selected list header, items grid, or empty/loading states.
 */
export default function ListItemModal({
  selectedList,
  selectedItems,
  itemsLoading,
  onRemoveItem,
}: ListItemModalProps) {
  if (selectedList === null) {
    return (
      <div className={styles.rightEmpty}>
        <span className={styles.emptyIcon}>📋</span>
        <span className={styles.emptyTitle}>No list selected</span>
        <span className={styles.emptySubtitle}>
          Select a list on the left or create a new one to get started.
        </span>
      </div>
    )
  }

  return (
    <>
      <header className={styles.rightPanelHeader}>
        <h1 className={styles.rightPanelTitle}>
          {selectedList.name}
          {selectedItems !== null && (
            <span className={styles.rightPanelTitleCount}>
              {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </h1>
        {selectedList.description && (
          <p className={styles.rightPanelDescription}>{selectedList.description}</p>
        )}
      </header>

      {itemsLoading ? (
        <div className={styles.spinnerWrap}>Loading items…</div>
      ) : selectedItems !== null && selectedItems.length === 0 ? (
        <div className={styles.rightEmpty}>
          <span className={styles.emptyIcon}>🎬</span>
          <span className={styles.emptyTitle}>This list is empty</span>
          <span className={styles.emptySubtitle}>
            Browse movies and TV shows to add them here.
          </span>
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {(selectedItems ?? []).map(item => (
            <ItemCard
              key={`${item.media_type}-${item.media_id}`}
              item={item}
              onRemove={() =>
                onRemoveItem(item.list_id, item.media_id, item.media_type)
              }
            />
          ))}
        </div>
      )}
    </>
  )
}
