import type { Movie } from '@/features/movies/types/movie'
import type { TVShow } from '@/features/tv/types/tv'
import MovieGrid from '@/features/movies/components/MovieGrid'
import TVGrid from '@/features/tv/components/TVGrid'
import ErrorAlert from '@/components/ui/ErrorAlert'
import PageContent from '@/components/ui/PageContent'
import styles from '@/pages/BrowsePage.module.css'

export interface SearchResultsProps {
  mediaType: 'movie' | 'tv'
  searchQuery: string
  // Movie search
  searchMovies?: Movie[]
  movieSearchLoading?: boolean
  movieSearchError?: Error | null
  movieTotalResults?: number
  // TV search
  searchShows?: TVShow[]
  tvSearchLoading?: boolean
  tvSearchError?: Error | null
  tvTotalResults?: number
  // Actions
  favoriteIds: number[]
  onOpenMovie?: (id: number) => void
  onPrefetch?: (id: number) => void
  onToggleFavorite?: (movie: Movie) => void
  onOpenShow?: (id: number) => void
  onToggleFavoriteTV?: (show: TVShow) => void
}

/**
 * Unified search results component for movies and TV shows.
 * Renders a results grid with result count and inline error state.
 */
export default function SearchResults({
  mediaType,
  searchQuery,
  searchMovies = [],
  movieSearchLoading = false,
  movieSearchError,
  movieTotalResults,
  searchShows = [],
  tvSearchLoading = false,
  tvSearchError,
  tvTotalResults,
  favoriteIds,
  onOpenMovie,
  onPrefetch,
  onToggleFavorite,
  onOpenShow,
  onToggleFavoriteTV,
}: SearchResultsProps) {
  if (mediaType === 'movie') {
    return (
      <div className={styles.page}>
        <PageContent className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Results for &ldquo;{searchQuery}&rdquo;
              {movieTotalResults !== undefined && (
                <span className={styles.count}>
                  {movieTotalResults === 1 ? '1 movie' : `${movieTotalResults} movies`}
                </span>
              )}
            </h2>
          </div>
          {movieSearchError && (
            <ErrorAlert message="Failed to search movies. Please try again." />
          )}
          <MovieGrid
            movies={searchMovies}
            isLoading={movieSearchLoading}
            error={movieSearchError}
            onOpenMovie={onOpenMovie ?? (() => {})}
            onPrefetch={onPrefetch}
            favorites={favoriteIds}
            onToggleFavorite={onToggleFavorite}
            emptyMessage={`No results for "${searchQuery}"`}
          />
        </PageContent>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <PageContent className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Results for &ldquo;{searchQuery}&rdquo;
            {tvTotalResults !== undefined && (
              <span className={styles.count}>
                {tvTotalResults === 1 ? '1 show' : `${tvTotalResults} shows`}
              </span>
            )}
          </h2>
        </div>
        {tvSearchError && (
          <ErrorAlert message="Failed to search TV shows. Please try again." />
        )}
        <TVGrid
          shows={searchShows}
          isLoading={tvSearchLoading}
          error={tvSearchError}
          onOpenShow={onOpenShow ?? (() => {})}
          emptyMessage={`No results for "${searchQuery}"`}
          favorites={favoriteIds}
          onToggleFavorite={onToggleFavoriteTV}
        />
      </PageContent>
    </div>
  )
}
