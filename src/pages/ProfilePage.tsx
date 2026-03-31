import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useWatched } from '@/features/watched/useWatched'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { deleteAccount } from '@/features/auth/authService'
import type { WatchedItem } from '@/features/watched/store'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import { getPosterUrl, formatDate } from '@/lib/helpers'
import Button from '@/components/ui/Button'
import PageContent from '@/components/ui/PageContent'
import { SkeletonCardGrid } from '@/components/ui/SkeletonCard'
import styles from './ProfilePage.module.css'

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives the display name from a Firebase user.
 * Falls back to the email prefix before '@' if displayName is absent.
 */
function getDisplayName(displayName: string | null, email: string | null): string {
  if (displayName) return displayName
  if (email) return email.split('@')[0]
  return 'User'
}

/**
 * Returns the first letter (uppercase) to use as the avatar initial.
 */
function getInitial(displayName: string | null, email: string | null): string {
  const name = getDisplayName(displayName, email)
  return name.charAt(0).toUpperCase()
}

/**
 * Extracts the title from a watched item's media_data, handling
 * Movie (has `title`) vs TVShow (has `name`).
 */
function getMediaTitle(mediaData: Movie | TVShow | undefined): string {
  if (!mediaData) return 'Unknown'
  if ('title' in mediaData) return mediaData.title
  return mediaData.name
}

/**
 * Extracts the poster_path from a watched item's media_data.
 */
function getMediaPosterPath(mediaData: Movie | TVShow | undefined): string | null {
  return mediaData?.poster_path ?? null
}

// ── AnimatedCounter ───────────────────────────────────────────────────────────

/**
 * Renders a stat number with a YouTube-style vertical carousel animation.
 * When `value` changes, React re-mounts the element (via `key`) and the CSS
 * animation replays — new number slides in from below, old one is gone.
 */
function AnimatedCounter({ value }: { value: number }) {
  return (
    <span
      key={value}
      className={`${styles.statValue} ${styles.statValueAnimate}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {value}
    </span>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface WatchedCardProps {
  item: WatchedItem
  onRemove: (item: WatchedItem) => void
  onNavigate: (mediaType: string, mediaId: number) => void
}

/**
 * Renders a single card in the Watch History grid.
 */
function WatchedCard({ item, onRemove, onNavigate }: WatchedCardProps) {
  const title = getMediaTitle(item.media_data)
  const posterPath = getMediaPosterPath(item.media_data)

  function handleCardClick() {
    onNavigate(item.media_type, item.media_id)
  }

  function handleRemoveClick(e: React.MouseEvent) {
    e.stopPropagation()
    onRemove(item)
  }

  return (
    <article className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className={styles.posterWrap}>
        <img
          src={getPosterUrl(posterPath, 'sm')}
          alt={title}
          className={styles.poster}
          loading="lazy"
        />
        <button
          className={styles.trashBtn}
          onClick={handleRemoveClick}
          aria-label={`Remove ${title} from watch history`}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardTitle}>{title}</p>
        <p className={styles.cardMeta} style={{ marginTop: 'auto' }}>
          {formatDate(item.watched_at)}
        </p>
      </div>
    </article>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * ProfilePage — displays the authenticated user's profile, stats,
 * watch history, and ratings.
 *
 * Route: /profile (behind AuthGuard — user is always authenticated here).
 */
export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { watchedList, toggleWatched, loading: watchedLoading } = useWatched()
  const { favorites, watchlist } = useFavorites()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const displayName = getDisplayName(user?.displayName ?? null, user?.email ?? null)
  const initial = getInitial(user?.displayName ?? null, user?.email ?? null)

  // Sort watched list most-recently-watched first
  const sortedWatched = useMemo(
    () =>
      [...watchedList].sort(
        (a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
      ),
    [watchedList]
  )

  function handleRemoveWatched(item: WatchedItem) {
    toggleWatched({
      media_id: item.media_id,
      media_type: item.media_type,
      media_data: item.media_data,
    })
  }

  function handleNavigateToMedia(mediaType: string, mediaId: number) {
    navigate(`/${mediaType}/${mediaId}`)
  }

  async function handleSignOut() {
    await signOut()
  }

  async function handleDeleteAccount() {
    if (!user) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const token = await user.getIdToken()
      await deleteAccount(token)
      navigate('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setDeleteError(message)
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.page}>
      <PageContent className={styles.content}>
        {/* ── User Header ──────────────────────────────────────────────── */}
        <header className={styles.userHeader}>
          <div className={styles.avatar} aria-hidden="true">
            {initial}
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.displayName}>{displayName}</h1>
            {user?.email && <p className={styles.email}>{user.email}</p>}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSignOut}
            className={styles.signOutHeader}
          >
            Sign out
          </Button>
        </header>

        {/* ── Stats Row ────────────────────────────────────────────────── */}
        <section aria-label="Profile statistics" className={styles.statsRow}>
          <div className={styles.statTile}>
            <AnimatedCounter value={favorites.length} />
            <span className={styles.statLabel}>Favorites</span>
          </div>
          <div className={styles.statTile}>
            <AnimatedCounter value={watchlist.length} />
            <span className={styles.statLabel}>Watchlist</span>
          </div>
          <div className={styles.statTile}>
            <AnimatedCounter value={watchedList.length} />
            <span className={styles.statLabel}>Watched</span>
          </div>
        </section>

        {/* ── Watch History ─────────────────────────────────────────────── */}
        <section aria-labelledby="watch-history-heading">
          <h2 className={styles.sectionHeading} id="watch-history-heading">
            Watch History
          </h2>
          {watchedLoading ? (
            <SkeletonCardGrid count={6} />
          ) : sortedWatched.length === 0 ? (
            <p className={styles.emptyState}>Nothing watched yet. Start exploring!</p>
          ) : (
            <div className={styles.grid}>
              {sortedWatched.map(item => (
                <WatchedCard
                  key={`${item.media_type}-${item.media_id}`}
                  item={item}
                  onRemove={handleRemoveWatched}
                  onNavigate={handleNavigateToMedia}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Danger Zone ──────────────────────────────────────────────── */}
        <div className={styles.dangerZone}>
          <button
            type="button"
            className={styles.deleteAccountBtn}
            onClick={() => {
              setDeleteError(null)
              setShowDeleteModal(true)
            }}
          >
            Delete account
          </button>
        </div>
      </PageContent>

      {/* ── Delete Account Modal ──────────────────────────────────────────── */}
      {showDeleteModal && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={e => {
            if (e.target === e.currentTarget) setShowDeleteModal(false)
          }}
        >
          <div className={styles.modalCard}>
            <h2 className={styles.modalTitle} id="delete-modal-title">
              Delete account
            </h2>
            <p className={styles.modalBody}>
              This will permanently delete your account and all your data. This action cannot be
              undone.
            </p>
            {deleteError && <p className={styles.modalError}>{deleteError}</p>}
            <div className={styles.modalActions}>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                className={styles.deleteDangerBtn}
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
