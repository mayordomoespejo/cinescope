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
            {/* Favorite */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <IconButton
                  size="md"
                  active={isFavorite}
                  onClick={onToggleFavorite}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={isFavorite}
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
                </IconButton>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className={styles.tooltipContent} side="bottom" sideOffset={6}>
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            {/* Watchlist */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <IconButton
                  size="md"
                  active={isInWatchlist}
                  onClick={onToggleWatchlist}
                  aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                  aria-pressed={isInWatchlist}
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
                </IconButton>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className={styles.tooltipContent} side="bottom" sideOffset={6}>
                  {isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            {/* Watched */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <IconButton
                  size="md"
                  success={isWatched}
                  onClick={onToggleWatched}
                  aria-label={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                  aria-pressed={isWatched}
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
                </IconButton>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className={styles.tooltipContent} side="bottom" sideOffset={6}>
                  {isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </Tooltip.Provider>
      )}
    </aside>
  )
}
