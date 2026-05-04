import styles from '../Navbar.module.css'
import HistoryDropdown from '../HistoryDropdown'
import { useNavSearch } from './useNavSearch'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * Search input with debounced navigation, history dropdown, and "/" keyboard shortcut.
 * All search state and logic lives in useNavSearch.
 */
export default function NavSearchBar() {
  const {
    query,
    focused,
    history,
    inputRef,
    handleChange,
    handleSubmit,
    handleFocus,
    handleBlur,
    handleHistoryClick,
    handleClear,
    handleHistoryClear,
  } = useNavSearch()

  const isMobile = useMediaQuery('(max-width: 640px)')

  return (
    <div className={styles.searchWrapper} role="search">
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <span className={styles.searchIcon} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isMobile ? 'Search movies…' : 'Search movies… ("/" to focus)'}
          className={styles.searchInput}
          aria-label="Search movies"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </form>

      <HistoryDropdown
        visible={focused}
        history={history}
        onSelect={handleHistoryClick}
        onClear={handleHistoryClear}
      />
    </div>
  )
}
