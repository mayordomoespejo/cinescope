import { useState, useEffect, useRef, useCallback } from 'react'
import { useLists } from '@/features/lists/useLists'
import type { ListItem } from '@/features/lists/store'
import ListGrid from '@/features/lists/components/ListGrid'
import ListForm from '@/features/lists/components/ListForm'
import ListItemModal from '@/features/lists/components/ListItemModal'
import PageContent from '@/components/ui/PageContent'
import styles from './ListsPage.module.css'

/**
 * ListsPage — custom lists management UI.
 * Two-panel layout: left panel shows all lists, right panel shows selected list's items.
 * Delegates rendering to ListGrid, ListForm, and ListItemModal.
 */
export default function ListsPage() {
  const { lists, createList, deleteList, renameList, fetchListItems, removeFromList } =
    useLists()

  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // items state keyed by listId
  const [itemsByList, setItemsByList] = useState<Record<string, ListItem[]>>({})

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
    (listId: string) => {
      if (itemsByListRef.current[listId]) return // already loaded
      const items = fetchListItems(listId)
      setItemsByList(prev => ({ ...prev, [listId]: items }))
    },
    [fetchListItems]
  )

  useEffect(() => {
    if (selectedListId) loadItems(selectedListId)
  }, [selectedListId, loadItems])

  const handleSelectList = (listId: string) => {
    setSelectedListId(listId)
  }

  const handleCreateList = (name: string, description: string) => {
    const newList = createList(name, description || undefined)
    setShowCreateForm(false)
    setSelectedListId(newList.id)
    setItemsByList(prev => ({ ...prev, [newList.id]: [] }))
  }

  const handleDeleteList = (listId: string) => {
    deleteList(listId)
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

  const handleRenameList = (listId: string, newName: string) => {
    renameList(listId, newName)
  }

  const handleRemoveItem = (listId: string, mediaId: number, mediaType: 'movie' | 'tv') => {
    removeFromList(listId, mediaId, mediaType)
    setItemsByList(prev => ({
      ...prev,
      [listId]: (prev[listId] ?? []).filter(
        it => !(it.media_id === mediaId && it.media_type === mediaType)
      ),
    }))
  }

  const selectedList = lists.find(l => l.id === selectedListId) ?? null
  const selectedItems = selectedListId ? (itemsByList[selectedListId] ?? null) : null

  const itemCounts = Object.fromEntries(
    Object.entries(itemsByList).map(([id, items]) => [id, items.length])
  )

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
            <ListForm onSubmit={handleCreateList} onCancel={() => setShowCreateForm(false)} />
          )}

          <ListGrid
            lists={lists}
            selectedListId={selectedListId}
            itemCounts={itemCounts}
            onSelect={handleSelectList}
            onRename={handleRenameList}
            onDelete={handleDeleteList}
          />
        </aside>

        {/* ── Right panel ── */}
        <main className={styles.rightPanel} aria-label="List items">
          <ListItemModal
            selectedList={selectedList}
            selectedItems={selectedItems}
            onRemoveItem={handleRemoveItem}
          />
        </main>
      </div>
    </PageContent>
  )
}
