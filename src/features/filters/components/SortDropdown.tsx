import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { SORT_OPTIONS, type SortOption } from '@/lib/config'
import styles from './SortDropdown.module.css'

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const SORT_LABELS: Record<SortOption, string> = {
  'popularity.desc': 'Most Popular',
  'vote_average.desc': 'Highest Rated',
  'primary_release_date.desc': 'Newest First',
  'primary_release_date.asc': 'Oldest First',
  'revenue.desc': 'Highest Revenue',
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={styles.trigger} aria-label="Sort movies by">
        <span className={styles.triggerIcon} aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </span>
        {SORT_LABELS[value] ?? 'Sort by'}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} align="end" sideOffset={6}>
          {SORT_OPTIONS.map(option => (
            <DropdownMenu.Item
              key={option.value}
              className={`${styles.item} ${value === option.value ? styles.itemActive : ''}`}
              onSelect={() => onChange(option.value)}
            >
              <span className={styles.checkmark} aria-hidden="true">
                ✓
              </span>
              {SORT_LABELS[option.value]}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
