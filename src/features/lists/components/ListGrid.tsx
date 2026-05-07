import { useEffect, useRef, useState } from 'react'
import type { CinescopeList } from '../store'
import styles from '@/pages/ListsPage.module.css'

interface ListRowProps {
  list: CinescopeList
  itemCount: number
  isSelected: boolean
  onSelect: () => void
  onRename: (newName: string) => Promise<void>
  onDelete: () => Promise<void>
}

/**
 * A single row in the list sidebar.
 * Supports inline rename (click pencil → input) and inline delete confirmation.
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
            aria-label="Rename list"
            type="button"
          >
            ✏️
          </button>
          <button
            className={`${styles.actionBtn} ${styles.danger}`}
            onClick={handleDeleteClick}
            title="Delete list"
            aria-label="Delete list"
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

export interface ListGridProps {
  lists: CinescopeList[]
  loading: boolean
  selectedListId: string | null
  itemCounts: Record<string, number>
  onSelect: (listId: string) => void
  onRename: (listId: string, newName: string) => Promise<void>
  onDelete: (listId: string) => Promise<void>
}

/**
 * Left-panel list of user's custom lists with inline rename/delete per row.
 */
export default function ListGrid({
  lists,
  loading,
  selectedListId,
  itemCounts,
  onSelect,
  onRename,
  onDelete,
}: ListGridProps) {
  if (loading) {
    return <div className={styles.spinnerWrap}>Loading…</div>
  }

  if (lists.length === 0) {
    return (
      <div className={styles.leftEmpty}>
        No lists yet.
        <br />
        Create your first list!
      </div>
    )
  }

  return (
    <ul className={styles.listItems} role="listbox" aria-label="Custom lists">
      {lists.map(list => (
        <ListRow
          key={list.id}
          list={list}
          itemCount={itemCounts[list.id] ?? 0}
          isSelected={list.id === selectedListId}
          onSelect={() => onSelect(list.id)}
          onRename={newName => onRename(list.id, newName)}
          onDelete={() => onDelete(list.id)}
        />
      ))}
    </ul>
  )
}
