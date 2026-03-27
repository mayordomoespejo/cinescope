import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useWatched } from '@/features/watched/useWatched'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { getAllRatings } from '@/features/ratings/store'
import { deleteRating } from '@/features/ratings/store'
import type { RatingEntry } from '@/features/ratings/store'
import type { WatchedItem } from '@/features/watched/store'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import { getPosterUrl, formatDate } from '@/lib/helpers'
import Button from '@/components/ui/Button'
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

// ── Sub-components ────────────────────────────────────────────────────────────

interface WatchedCardProps {
  item: WatchedItem
  onRemove: (item: WatchedItem) => void
}

/**
 * Renders a single card in the Watch History grid.
 */
function WatchedCard({ item, onRemove }: WatchedCardProps) {
  const title = getMediaTitle(item.media_data)
  const posterPath = getMediaPosterPath(item.media_data)

  return (
    <article className={styles.card}>
      <div className={styles.posterWrap}>
        <img
          src={getPosterUrl(posterPath, 'sm')}
          alt={title}
          className={styles.poster}
          loading="lazy"
        />
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardTitle}>{title}</p>
        <p className={styles.cardMeta}>{formatDate(item.watched_at)}</p>
        <Button
          variant="ghost"
          size="sm"
          className={styles.removeBtn}
          onClick={() => onRemove(item)}
          aria-label={`Remove ${title} from watch history`}
        >
          Remove
        </Button>
      </div>
    </article>
  )
}

interface RatingCardProps {
  entry: RatingEntry
  onDelete: (entry: RatingEntry) => void
}

/**
 * Renders a single card in the My Ratings grid.
 * Since RatingEntry has no media_data, only the rating badge and metadata
 * can be displayed from the entry itself; title/poster are not available.
 */
function RatingCard({ entry, onDelete }: RatingCardProps) {
  const label = `${entry.media_type === 'movie' ? 'Movie' : 'TV'} #${entry.media_id}`

  return (
    <article className={styles.card}>
      <div className={styles.posterWrap}>
        <div className={styles.posterPlaceholder} aria-hidden="true">
          <span className={styles.ratingBadgeLarge}>{entry.rating}</span>
        </div>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardTitle}>{label}</p>
        <p className={styles.cardMeta}>{formatDate(entry.created_at)}</p>
        {entry.note && <p className={styles.note}>{entry.note}</p>}
        <div className={styles.ratingBadgeRow}>
          <span className={styles.ratingBadge} aria-label={`Rating: ${entry.rating} out of 10`}>
            ★ {entry.rating}/10
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={styles.removeBtn}
          onClick={() => onDelete(entry)}
          aria-label={`Delete rating for ${label}`}
        >
          Delete rating
        </Button>
      </div>
    </article>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = 'history' | 'ratings'

/**
 * ProfilePage — displays the authenticated user's profile, stats,
 * watch history, and ratings.
 *
 * Route: /profile (behind AuthGuard — user is always authenticated here).
 */
export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { watchedList, toggleWatched } = useWatched()
  const { favorites, watchlist } = useFavorites()
  const [ratings, setRatings] = useState<RatingEntry[]>(() => getAllRatings())
  const [activeTab, setActiveTab] = useState<Tab>('history')

  // Keep ratings in sync when the storage event fires
  useEffect(() => {
    const sync = () => setRatings(getAllRatings())
    window.addEventListener('cinescope:ratings-change', sync)
    return () => window.removeEventListener('cinescope:ratings-change', sync)
  }, [])

  const displayName = getDisplayName(user?.displayName ?? null, user?.email ?? null)
  const initial = getInitial(user?.displayName ?? null, user?.email ?? null)

  // Sort watched list most-recently-watched first
  const sortedWatched = [...watchedList].sort(
    (a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
  )

  // Sort ratings most-recently-rated first
  const sortedRatings = [...ratings].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  function handleRemoveWatched(item: WatchedItem) {
    toggleWatched({
      media_id: item.media_id,
      media_type: item.media_type,
      media_data: item.media_data,
    })
  }

  function handleDeleteRating(entry: RatingEntry) {
    if (!user) return
    deleteRating(user.uid, entry.media_id, entry.media_type)
    setRatings(getAllRatings())
  }

  async function handleSignOut() {
    await signOut()
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
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
            <span className={styles.statValue}>{favorites.length}</span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
          <div className={styles.statTile}>
            <span className={styles.statValue}>{watchlist.length}</span>
            <span className={styles.statLabel}>Watchlist</span>
          </div>
          <div className={styles.statTile}>
            <span className={styles.statValue}>{watchedList.length}</span>
            <span className={styles.statLabel}>Watched</span>
          </div>
          <div className={styles.statTile}>
            <span className={styles.statValue}>{ratings.length}</span>
            <span className={styles.statLabel}>Ratings</span>
          </div>
        </section>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div
          className={styles.tabs}
          role="tablist"
          aria-label="Profile sections"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'history'}
            aria-controls="panel-history"
            id="tab-history"
            className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Watch History
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'ratings'}
            aria-controls="panel-ratings"
            id="tab-ratings"
            className={`${styles.tab} ${activeTab === 'ratings' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('ratings')}
          >
            My Ratings
          </button>
        </div>

        {/* ── Watch History Panel ───────────────────────────────────────── */}
        <div
          role="tabpanel"
          id="panel-history"
          aria-labelledby="tab-history"
          hidden={activeTab !== 'history'}
        >
          {sortedWatched.length === 0 ? (
            <p className={styles.emptyState}>
              Nothing watched yet. Start exploring!
            </p>
          ) : (
            <div className={styles.grid}>
              {sortedWatched.map(item => (
                <WatchedCard
                  key={`${item.media_type}-${item.media_id}`}
                  item={item}
                  onRemove={handleRemoveWatched}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Ratings Panel ────────────────────────────────────────────── */}
        <div
          role="tabpanel"
          id="panel-ratings"
          aria-labelledby="tab-ratings"
          hidden={activeTab !== 'ratings'}
        >
          {sortedRatings.length === 0 ? (
            <p className={styles.emptyState}>No ratings yet.</p>
          ) : (
            <div className={styles.grid}>
              {sortedRatings.map(entry => (
                <RatingCard
                  key={`${entry.media_type}-${entry.media_id}`}
                  entry={entry}
                  onDelete={handleDeleteRating}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Account Section ──────────────────────────────────────────── */}
        <section aria-labelledby="account-heading" className={styles.accountSection}>
          <h2 className={styles.accountHeading} id="account-heading">
            Account
          </h2>
          {user?.email && (
            <p className={styles.accountEmail}>
              <span className={styles.accountLabel}>Email</span>
              <span>{user.email}</span>
            </p>
          )}
          <Button variant="secondary" onClick={handleSignOut}>
            Sign out
          </Button>
        </section>
      </div>
    </div>
  )
}
