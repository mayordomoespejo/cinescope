import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatched } from '@/features/watched/useWatched'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { ProfileStats } from '@/features/profile/components/ProfileStats'
import { WatchedSection } from '@/features/watched/components/WatchedSection'
import { AccountActions } from '@/features/profile/components/AccountActions'
import { useProfileActions } from '@/features/profile/components/useProfileActions'
import type { WatchedItem } from '@/features/watched/store'
import PageContent from '@/components/ui/PageContent'
import styles from './ProfilePage.module.css'

/**
 * ProfilePage — displays the user's stats, watch history, and data management actions.
 * All data is read from local stores persisted in localStorage.
 *
 * Route: /profile
 */
export default function ProfilePage() {
  const navigate = useNavigate()
  const { watchedList, toggleWatched } = useWatched()
  const { favorites, watchlist } = useFavorites()
  const { isClearing, handleClearData } = useProfileActions()

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
        <ProfileStats
          favoritesCount={favorites.length}
          watchlistCount={watchlist.length}
          watchedCount={watchedList.length}
        />

        <WatchedSection
          items={sortedWatched}
          onRemove={handleRemoveWatched}
          onNavigate={(mediaType, mediaId) => navigate(`/${mediaType}/${mediaId}`)}
        />

        <AccountActions isClearing={isClearing} onClearData={handleClearData} />
      </PageContent>
    </div>
  )
}
