import type { SortOption } from '@/lib/config'
import type { Movie } from '../types/movie'
import HeroSection from './HeroSection'
import MovieCarousel from './MovieCarousel'
import MovieGrid from './MovieGrid'
import GenreFilter from '@/features/filters/components/GenreFilter'
import SortDropdown from '@/features/filters/components/SortDropdown'
import AdvancedFilters from '@/features/filters/components/AdvancedFilters'
import ErrorAlert from '@/components/ui/ErrorAlert'
import styles from '@/pages/BrowsePage.module.css'

export interface MovieBrowseSectionProps {
  trendingMovies: Movie[]
  topRatedMovies: Movie[]
  discoverMovies: Movie[]
  movieTrendingLoading: boolean
  movieTopRatedLoading: boolean
  movieDiscoverLoading: boolean
  movieDiscoverError: Error | null
  hasNextMovieDiscover: boolean
  favoriteIds: number[]
  selectedGenre: number | null
  sortBy: SortOption
  minRating: number
  selectedYear: number | undefined
  selectedLanguage: string
  onOpenMovie: (id: number) => void
  onPrefetch: (id: number) => void
  onToggleFavorite: (movie: Movie) => void
  onGenreSelect: (id: number | null) => void
  onSortChange: (value: SortOption) => void
  onMinRatingChange: (value: number) => void
  onYearChange: (value: number | undefined) => void
  onLanguageChange: (value: string) => void
  onLoadMore: () => void
}

/**
 * Movie discovery section: hero, trending + top-rated carousels, discover grid with filters.
 */
export default function MovieBrowseSection({
  trendingMovies,
  topRatedMovies,
  discoverMovies,
  movieTrendingLoading,
  movieTopRatedLoading,
  movieDiscoverLoading,
  movieDiscoverError,
  hasNextMovieDiscover,
  favoriteIds,
  selectedGenre,
  sortBy,
  minRating,
  selectedYear,
  selectedLanguage,
  onOpenMovie,
  onPrefetch,
  onToggleFavorite,
  onGenreSelect,
  onSortChange,
  onMinRatingChange,
  onYearChange,
  onLanguageChange,
  onLoadMore,
}: MovieBrowseSectionProps) {
  const featuredMovie = trendingMovies.find(m => !!m.backdrop_path) ?? trendingMovies[0]

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
            <SortDropdown value={sortBy} onChange={onSortChange} />
          </div>
          <GenreFilter selectedGenreId={selectedGenre} onSelect={onGenreSelect} />
          <AdvancedFilters
            minRating={minRating}
            onMinRatingChange={onMinRatingChange}
            year={selectedYear}
            onYearChange={onYearChange}
            language={selectedLanguage}
            onLanguageChange={onLanguageChange}
          />
          {movieDiscoverError && (
            <ErrorAlert
              message="Failed to load discover results."
              onRetry={onLoadMore}
            />
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
