import { useState, useEffect, useRef, useCallback } from 'react'
import { useLists } from '@/features/lists/useLists'
import { getPosterUrl, getReleaseYear } from '@/lib/helpers'
import type { CinescopeList, ListItem } from '@/features/lists/store'
import PageContent from '@/components/ui/PageContent'
import styles from './ListsPage.module.css'

// ── Types ────────────────────────────────────────────────────────────

/** Extract a display title from media_data (TMDB movie or tv shape). */
function getMediaTitle(item: ListItem): string {
  const d = item.media_data
  return (d.title as string) || (d.name as string) || 'Untitled'
}

/** Extract a release date string from media_data. */
function getMediaDate(item: ListItem): string | null {
  const d = item.media_data
  return (d.release_date as string) || (d.first_air_date as string) || null
}

/** Extract a poster_path string from media_data. */
function getMediaPoster(item: ListItem): string | null {
  return (item.media_data.poster_path as string) || null
}

// ── Sub-components ───────────────────────────────────────────────────

interface CreateFormProps {
  onSubmit: (name: string, description: string) => Promise<void>
  onCancel: () => void
}

/**
 * Inline form for creating a new list.
 */
function CreateListForm({ onSubmit, onCancel }: CreateFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(name, description)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.createForm} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className={styles.input}
        placeholder="List name (required)"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={80}
        disabled={submitting}
      />
      <input
        className={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        maxLength={200}
        disabled={submitting}
      />
      <div className={styles.createFormActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={!name.trim() || submitting}>
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </div>
    </form>
  )
}

// ────────────────────────────────────────────────────────────────────

interface ListRowProps {
  list: CinescopeList
  itemCount: number
  isSelected: boolean
  onSelect: () => void
  onRename: (newName: string) => Promise<void>
  onDelete: () => Promise<void>
}

/**
 * A single row in the left-panel list.
 * Supports inline rename (click name → input) and inline delete confirm.
 */
function ListRow({ list, itemCount, isSelected, onSelect, onRename, onDelete }: ListRowProps) {
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(list.name)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renaming) renameRef.current?.focus()
  }, [renaming])

  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRenameValue(list.name)
    setRenaming(true)
  }

  const commitRename = async () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== list.name) {
      await onRename(trimmed)
    }
    setRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void commitRename()
    if (e.key === 'Escape') setRenaming(false)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmingDelete(true)
  }

  const confirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmingDelete(false)
  }

  return (
    <li className={styles.listItem}>
      <button
        className={`${styles.listItemBtn} ${isSelected ? styles.selected : ''}`}
        onClick={onSelect}
        type="button"
      >
        {renaming ? (
          <input
            ref={renameRef}
            className={styles.renameInput}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={() => void commitRename()}
            onKeyDown={handleRenameKeyDown}
            onClick={e => e.stopPropagation()}
            maxLength={80}
          />
        ) : (
          <span className={styles.listItemName}>{list.name}</span>
        )}
        <span className={styles.listItemCount}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </button>

      {!renaming && (
        <div className={styles.listItemActions}>
          <button
            className={styles.actionBtn}
            onClick={startRename}
            title="Rename list"
            type="button"
          >
            ✏️
          </button>
          <button
            className={`${styles.actionBtn} ${styles.danger}`}
            onClick={handleDeleteClick}
            title="Delete list"
            type="button"
          >
            🗑️
          </button>
        </div>
      )}

      {confirmingDelete && (
        <div className={styles.deleteConfirm}>
          <span className={styles.deleteConfirmText}>Delete "{list.name}"?</span>
          <div className={styles.deleteConfirmActions}>
            <button
              className={styles.confirmNo}
              onClick={cancelDelete}
              disabled={deleting}
              type="button"
            >
              No
            </button>
            <button
              className={styles.confirmYes}
              onClick={confirmDelete}
              disabled={deleting}
              type="button"
            >
              {deleting ? '…' : 'Yes'}
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

// ────────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: ListItem
  onRemove: () => Promise<void>
}

/**
 * A single media item card in the right panel grid.
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

// ── Main component ────────────────────────────────────────────────────

/**
 * ListsPage — full custom lists management UI.
 * Two-panel layout: left panel shows list of all lists,
 * right panel shows items in the selected list.
 */
export default function ListsPage() {
  const { lists, loading, createList, deleteList, renameList, fetchListItems, removeFromList } =
    useLists()

  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // items state keyed by listId
  const [itemsByList, setItemsByList] = useState<Record<string, ListItem[]>>({})
  const [itemsLoading, setItemsLoading] = useState(false)

  // Auto-select first list when lists load
  useEffect(() => {
    if (!selectedListId && lists.length > 0) {
      setSelectedListId(lists[0].id)
    }
  }, [lists, selectedListId])

  const itemsByListRef = useRef(itemsByList)
  itemsByListRef.current = itemsByList

  // Fetch items when selected list changes
  const loadItems = useCallback(
    async (listId: string) => {
      if (itemsByListRef.current[listId]) return // already loaded
      setItemsLoading(true)
      try {
        const items = await fetchListItems(listId)
        setItemsByList(prev => ({ ...prev, [listId]: items }))
      } finally {
        setItemsLoading(false)
      }
    },
    [fetchListItems]
  )

  useEffect(() => {
    if (selectedListId) void loadItems(selectedListId)
  }, [selectedListId, loadItems])

  const handleSelectList = (listId: string) => {
    setSelectedListId(listId)
  }

  const handleCreateList = async (name: string, description: string) => {
    const newList = await createList(name, description || undefined)
    setShowCreateForm(false)
    setSelectedListId(newList.id)
    setItemsByList(prev => ({ ...prev, [newList.id]: [] }))
  }

  const handleDeleteList = async (listId: string) => {
    await deleteList(listId)
    if (selectedListId === listId) {
      const remaining = lists.filter(l => l.id !== listId)
      setSelectedListId(remaining.length > 0 ? remaining[0].id : null)
    }
    setItemsByList(prev => {
      const next = { ...prev }
      delete next[listId]
      return next
    })
  }

  const handleRenameList = async (listId: string, newName: string) => {
    await renameList(listId, newName)
  }

  const handleRemoveItem = async (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
    await removeFromList(listId, mediaId, mediaType)
    setItemsByList(prev => ({
      ...prev,
      [listId]: (prev[listId] ?? []).filter(
        it => !(it.media_id === mediaId && it.media_type === mediaType)
      ),
    }))
  }

  const selectedList = lists.find(l => l.id === selectedListId) ?? null
  const selectedItems = selectedListId ? (itemsByList[selectedListId] ?? null) : null

  const getItemCount = (listId: string): number => itemsByList[listId]?.length ?? 0

  return (
    <PageContent className={styles.page}>
      <div className={styles.layout}>
        {/* ── Left panel ── */}
        <aside className={styles.leftPanel} aria-label="My Lists">
          <div className={styles.leftPanelHeader}>
            <span className={styles.panelTitle}>
              My Lists
              {lists.length > 0 && <span className={styles.panelTitleCount}>{lists.length}</span>}
            </span>
            <button
              className={styles.newListBtn}
              onClick={() => setShowCreateForm(v => !v)}
              type="button"
            >
              + New List
            </button>
          </div>

          {showCreateForm && (
            <CreateListForm onSubmit={handleCreateList} onCancel={() => setShowCreateForm(false)} />
          )}

          {loading ? (
            <div className={styles.spinnerWrap}>Loading…</div>
          ) : lists.length === 0 ? (
            <div className={styles.leftEmpty}>
              No lists yet.
              <br />
              Create your first list!
            </div>
          ) : (
            <ul className={styles.listItems} role="listbox" aria-label="Custom lists">
              {lists.map(list => (
                <ListRow
                  key={list.id}
                  list={list}
                  itemCount={getItemCount(list.id)}
                  isSelected={list.id === selectedListId}
                  onSelect={() => handleSelectList(list.id)}
                  onRename={newName => handleRenameList(list.id, newName)}
                  onDelete={() => handleDeleteList(list.id)}
                />
              ))}
            </ul>
          )}
        </aside>

        {/* ── Right panel ── */}
        <main className={styles.rightPanel} aria-label="List items">
          {selectedList === null ? (
            <div className={styles.rightEmpty}>
              <span className={styles.emptyIcon}>📋</span>
              <span className={styles.emptyTitle}>No list selected</span>
              <span className={styles.emptySubtitle}>
                Select a list on the left or create a new one to get started.
              </span>
            </div>
          ) : (
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
                        handleRemoveItem(item.list_id, item.media_id, item.media_type)
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </PageContent>
  )
}
