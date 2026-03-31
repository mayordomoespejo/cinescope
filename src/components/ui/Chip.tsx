import styles from './Chip.module.css'

/** Props for the Chip component. */
interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  onRemove?: () => void
  size?: 'sm' | 'md'
  className?: string
}

/**
 * @description Toggleable chip/tag button, optionally with a remove action. Used for filter selections.
 * @param props - Component props
 */
export default function Chip({
  label,
  active = false,
  onClick,
  onRemove,
  size = 'md',
  className = '',
}: ChipProps) {
  return (
    <button
      type="button"
      className={[styles.chip, styles[size], active ? styles.active : '', className]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
      {onRemove ? (
        <span
          className={styles.remove}
          onClick={e => {
            e.stopPropagation()
            onRemove()
          }}
          role="button"
          aria-label={`Remove ${label}`}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              onRemove()
            }
          }}
        >
          ✕
        </span>
      ) : null}
    </button>
  )
}
