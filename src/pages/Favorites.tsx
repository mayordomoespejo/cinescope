import { useOutletContext } from '@/components/ui/LayoutContext'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { useMoviePrefetch } from '@/features/movies/hooks/useMoviePrefetch'
import SortableMovieGrid from '@/features/movies/components/SortableMovieGrid'
import { SkeletonCardGrid } from '@/components/ui/SkeletonCard'
import type { LayoutContext } from '@/components/ui/LayoutContext'
import PageContent from '@/components/ui/PageContent'
import styles from './Favorites.module.css'

export default function Favorites() {
  const { onOpenMovie } = useOutletContext<LayoutContext>()
  const { favorites, watchlist, isLoading, toggleFavorite, reorderFavorites, reorderWatchlist } =
    useFavorites()
  const { prefetchMovieData } = useMoviePrefetch()

  const favoriteIds = favorites.map(f => f.id)

  return (
    <div className={styles.page}>
      <PageContent className={styles.content}>
        {/* Favorites */}
        <section className={styles.section} aria-labelledby="favorites-title">
          <div className={styles.sectionHeader}>
            <h1 className={styles.pageTitle} id="favorites-title">
              My Favorites
              {!isLoading && <span className={styles.count}>{favorites.length}</span>}
            </h1>
          </div>
          {isLoading ? (
            <SkeletonCardGrid count={6} />
          ) : (
            <SortableMovieGrid
              movies={favorites}
              onReorder={reorderFavorites}
              onOpenMovie={onOpenMovie}
              onPrefetch={prefetchMovieData}
              favorites={favoriteIds}
              onToggleFavorite={toggleFavorite}
              emptyMessage="No favorites yet — save movies you love!"
            />
          )}
        </section>

        {/* Watchlist */}
        {(isLoading || watchlist.length > 0) && (
          <section className={styles.section} aria-labelledby="watchlist-title">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} id="watchlist-title">
                Watchlist
                {!isLoading && <span className={styles.count}>{watchlist.length}</span>}
              </h2>
            </div>
            {isLoading ? (
              <SkeletonCardGrid count={6} />
            ) : (
              <SortableMovieGrid
                movies={watchlist}
                onReorder={reorderWatchlist}
                onOpenMovie={onOpenMovie}
                onPrefetch={prefetchMovieData}
                favorites={favoriteIds}
                onToggleFavorite={toggleFavorite}
                emptyMessage="Your watchlist is empty."
              />
            )}
          </section>
        )}
      </PageContent>
    </div>
  )
}
