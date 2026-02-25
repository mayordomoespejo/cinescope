import { useOutletContext } from '@/components/ui/LayoutContext'
import { useQueryClient } from '@tanstack/react-query'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { fetchMovieDetail } from '@/features/movies/api/tmdbApi'
import { fetchMovieVideosForQuery } from '@/features/movies/hooks/useMovieVideos'
import { queryKeys } from '@/lib/queryKeys'
import MovieGrid from '@/features/movies/components/MovieGrid'
import type { LayoutContext } from '@/components/ui/LayoutContext'
import styles from './Favorites.module.css'

export default function Favorites() {
  const { onOpenMovie } = useOutletContext<LayoutContext>()
  const { favorites, watchlist, toggleFavorite } = useFavorites()
  const queryClient = useQueryClient()

  const handlePrefetch = (id: number) => {
    void queryClient.prefetchQuery({
      queryKey: queryKeys.movieDetail(id),
      queryFn: () => fetchMovieDetail(id),
    })
    void queryClient.prefetchQuery({
      queryKey: queryKeys.movieVideos(id),
      queryFn: () => fetchMovieVideosForQuery(id),
    })
  }

  const favoriteIds = favorites.map(f => f.id)

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* Favorites */}
        <section aria-labelledby="favorites-title">
          <div className={styles.sectionHeader}>
            <h1 className={styles.pageTitle} id="favorites-title">
              My Favorites
              <span className={styles.count}>{favorites.length}</span>
            </h1>
          </div>
          <MovieGrid
            movies={favorites}
            isLoading={false}
            onOpenMovie={onOpenMovie}
            onPrefetch={handlePrefetch}
            favorites={favoriteIds}
            onToggleFavorite={toggleFavorite}
            emptyMessage="No favorites yet — save movies you love!"
          />
        </section>

        {/* Watchlist */}
        {watchlist.length > 0 && (
          <section aria-labelledby="watchlist-title">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} id="watchlist-title">
                Watchlist
                <span className={styles.count}>{watchlist.length}</span>
              </h2>
            </div>
            <MovieGrid
              movies={watchlist}
              isLoading={false}
              onOpenMovie={onOpenMovie}
              onPrefetch={handlePrefetch}
              favorites={favoriteIds}
              onToggleFavorite={toggleFavorite}
              emptyMessage="Your watchlist is empty."
            />
          </section>
        )}
      </div>
    </div>
  )
}
