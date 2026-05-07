import * as Tooltip from '@radix-ui/react-tooltip'
import { getPosterUrl } from '@/lib/helpers'
import IconButton from '@/components/ui/IconButton'
import Skeleton from '@/components/ui/Skeleton'
import styles from './MediaDetailPoster.module.css'

interface MediaDetailPosterProps {
  isLoading: boolean
  posterPath: string | null | undefined
  title: string | undefined
  isFavorite: boolean
  isInWatchlist: boolean
  isWatched: boolean
  onToggleFavorite: () => void
  onToggleWatchlist: () => void
  onToggleWatched: () => void
  /** When false, action buttons are not rendered (no data yet). */
  showActions: boolean
}

interface ActionButtonProps {
  isActive: boolean
  activeState: 'active' | 'success'
  ariaLabel: string
  tooltipText: string
  onClick: () => void
  children: React.ReactNode
}

/** Reusable tooltip-wrapped icon button for media actions (favorite, watchlist, watched). */
function ActionButton({
  isActive,
  activeState,
  ariaLabel,
  tooltipText,
  onClick,
  children,
}: ActionButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton
          size="md"
          state={isActive ? activeState : undefined}
          onClick={onClick}
          aria-label={ariaLabel}
          aria-pressed={isActive}
        >
          {children}
        </IconButton>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={styles.tooltipContent} side="bottom" sideOffset={6}>
          {tooltipText}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default function MediaDetailPoster({
  isLoading,
  posterPath,
  title,
  isFavorite,
  isInWatchlist,
  isWatched,
  onToggleFavorite,
  onToggleWatchlist,
  onToggleWatched,
  showActions,
}: MediaDetailPosterProps) {
  return (
    <aside className={styles.posterCol}>
      {isLoading ? (
        <Skeleton width="100%" height="420px" borderRadius="var(--radius-lg)" />
      ) : (
        <img
          src={getPosterUrl(posterPath ?? null, 'md')}
          alt={title ? `${title} poster` : ''}
          className={styles.poster}
          loading="eager"
        />
      )}

      {showActions && (
        <Tooltip.Provider delayDuration={300}>
          <div className={styles.actions}>
            <ActionButton
              isActive={isFavorite}
              activeState="active"
              ariaLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              tooltipText={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={onToggleFavorite}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M10 17.5S2 12.5 2 7a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 5.5-8 10.5-8 10.5z"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ActionButton>

            <ActionButton
              isActive={isInWatchlist}
              activeState="active"
              ariaLabel={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              tooltipText={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              onClick={onToggleWatchlist}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M5 2h10a1 1 0 0 1 1 1v15l-6-3-6 3V3a1 1 0 0 1 1-1z"
                  fill={isInWatchlist ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ActionButton>

            <ActionButton
              isActive={isWatched}
              activeState="success"
              ariaLabel={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
              tooltipText={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
              onClick={onToggleWatched}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill={isWatched ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M6.5 10l2.5 2.5 4.5-4.5"
                  stroke={isWatched ? 'var(--color-bg)' : 'currentColor'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </ActionButton>
          </div>
        </Tooltip.Provider>
      )}
    </aside>
  )
}
