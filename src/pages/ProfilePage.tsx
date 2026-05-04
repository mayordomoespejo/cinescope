import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useWatched } from '@/features/watched/useWatched'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { ProfileStats } from '@/features/auth/components/ProfileStats'
import { WatchedSection } from '@/features/watched/components/WatchedSection'
import { AccountActions } from '@/features/auth/components/AccountActions'
import { useProfileActions } from '@/features/auth/components/useProfileActions'
import type { WatchedItem } from '@/features/watched/store'
import Button from '@/components/ui/Button'
import PageContent from '@/components/ui/PageContent'
import styles from './ProfilePage.module.css'

/**
 * ProfilePage — displays the authenticated user's profile, stats,
 * watch history, and account actions.
 *
 * Route: /profile (behind AuthGuard — user is always authenticated here).
 */
export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { watchedList, toggleWatched, loading: watchedLoading } = useWatched()
  const { favorites, watchlist } = useFavorites()
  const { isDeleting, deleteError, handleDeleteAccount } = useProfileActions()

  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'User'
  const initial = displayName.charAt(0).toUpperCase()

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

  return (
    <div className={styles.page}>
      <PageContent className={styles.content}>
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
            onClick={() => void signOut()}
            className={styles.signOutHeader}
          >
            Sign out
          </Button>
        </header>

        <ProfileStats
          favoritesCount={favorites.length}
          watchlistCount={watchlist.length}
          watchedCount={watchedList.length}
        />

        <WatchedSection
          items={sortedWatched}
          loading={watchedLoading}
          onRemove={handleRemoveWatched}
          onNavigate={(mediaType, mediaId) => navigate(`/${mediaType}/${mediaId}`)}
        />

        <AccountActions
          isDeleting={isDeleting}
          deleteError={deleteError}
          onDeleteAccount={handleDeleteAccount}
        />
      </PageContent>
    </div>
  )
}
