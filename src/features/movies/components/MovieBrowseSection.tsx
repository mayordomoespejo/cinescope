import { useMovieData } from '@/hooks/browse/useMovieData'
import { useBrowseFilters } from '@/hooks/browse/useBrowseFilters'
import { useBrowseHandlers } from '@/hooks/browse/useBrowseHandlers'
import HeroSection from './HeroSection'
import MovieCarousel from './MovieCarousel'
import MovieGrid from './MovieGrid'
import GenreFilter from '@/features/filters/components/GenreFilter'
import SortDropdown from '@/features/filters/components/SortDropdown'
import AdvancedFilters from '@/features/filters/components/AdvancedFilters'
import ErrorAlert from '@/components/ui/ErrorAlert'
import styles from '@/pages/BrowsePage.module.css'

/**
 * Movie discovery section: hero, trending + top-rated carousels, discover grid with filters.
 * Owns its own filter/data state — no prop drilling from parent.
 */
export default function MovieBrowseSection() {
  const {
    filters,
    onGenreSelect,
    onSortChange,
    onMinRatingChange,
    onYearChange,
    onLanguageChange,
    onLoadMore,
  } = useBrowseFilters()

  const {
    trendingMovies,
    topRatedMovies,
    discoverMovies,
    featuredMovie,
    movieTrendingLoading,
    movieTopRatedLoading,
    movieDiscoverLoading,
    movieDiscoverError,
    hasNextMovieDiscover,
  } = useMovieData('movie', filters)

  const { favoriteIds, onOpenMovie, onPrefetch, onToggleFavorite } = useBrowseHandlers()

  return (
    <div className={styles.page}>
      <HeroSection
        movie={featuredMovie}
        isLoading={movieTrendingLoading}
        onOpenMovie={onOpenMovie}
      />

      <div className={styles.content}>
        <MovieCarousel
          title="Trending Today"
          movies={trendingMovies}
          isLoading={movieTrendingLoading}
          onOpenMovie={onOpenMovie}
          onPrefetch={onPrefetch}
          favorites={favoriteIds}
          onToggleFavorite={onToggleFavorite}
        />

        <MovieCarousel
          title="Top Rated"
          movies={topRatedMovies}
          isLoading={movieTopRatedLoading}
          onOpenMovie={onOpenMovie}
          onPrefetch={onPrefetch}
          favorites={favoriteIds}
          onToggleFavorite={onToggleFavorite}
        />

        <section className={styles.section} aria-labelledby="discover-title">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="discover-title">
              Discover
            </h2>
            <SortDropdown value={filters.sortBy} onChange={onSortChange} />
          </div>
          <GenreFilter selectedGenreId={filters.genre} onSelect={onGenreSelect} />
          <AdvancedFilters
            minRating={filters.minRating}
            onMinRatingChange={onMinRatingChange}
            year={filters.year}
            onYearChange={onYearChange}
            language={filters.language}
            onLanguageChange={onLanguageChange}
          />
          {movieDiscoverError && (
            <ErrorAlert message="Failed to load discover results." onRetry={onLoadMore} />
          )}
          <MovieGrid
            movies={discoverMovies}
            isLoading={movieDiscoverLoading}
            error={movieDiscoverError}
            hasNextPage={hasNextMovieDiscover}
            onOpenMovie={onOpenMovie}
            onPrefetch={onPrefetch}
            onLoadMore={onLoadMore}
            favorites={favoriteIds}
            onToggleFavorite={onToggleFavorite}
          />
        </section>
      </div>
    </div>
  )
}
