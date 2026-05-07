import styles from './Navbar.module.css'

interface HistoryDropdownProps {
  visible: boolean
  history: string[]
  onSelect: (query: string) => void
  onClear: () => void
}

/**
 * Dropdown panel showing recent search history entries.
 * Rendered below the search input when the input is focused.
 */
export default function HistoryDropdown({
  visible,
  history,
  onSelect,
  onClear,
}: HistoryDropdownProps) {
  if (!visible || history.length === 0) return null

  return (
    <div
      id="search-history-listbox"
      className={styles.historyDropdown}
      role="listbox"
      aria-label="Recent searches"
    >
      <div className={styles.historyHeader}>
        <span>Recent</span>
        <button
          type="button"
          className={styles.clearHistory}
          onClick={onClear}
          aria-label="Clear search history"
        >
          Clear
        </button>
      </div>
      {history.map(q => (
        <button
          key={q}
          type="button"
          role="option"
          aria-selected={false}
          className={styles.historyItem}
          onMouseDown={e => {
            e.preventDefault() // prevent blur before click
            onSelect(q)
          }}
        >
          {q}
        </button>
      ))}
    </div>
  )
}
