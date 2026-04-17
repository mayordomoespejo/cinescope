import type { SortOption } from '@/lib/config'
import type { TVShow } from '../types/tv'
import TVHeroSection from './TVHeroSection'
import TVCarousel from './TVCarousel'
import TVGrid from './TVGrid'
import SortDropdown from '@/features/filters/components/SortDropdown'
import AdvancedFilters from '@/features/filters/components/AdvancedFilters'
import ErrorAlert from '@/components/ui/ErrorAlert'
import styles from '@/pages/BrowsePage.module.css'

export interface TVBrowseSectionProps {
  trendingShows: TVShow[]
  topRatedShows: TVShow[]
  discoverShows: TVShow[]
  tvTrendingLoading: boolean
  tvTopRatedLoading: boolean
  tvDiscoverLoading: boolean
  tvDiscoverError: Error | null
  tvGenres: Array<{ id: number; name: string }>
  tvGenresLoading: boolean
  hasNextTVDiscover: boolean
  favoriteIds: number[]
  selectedGenre: number | null
  sortBy: SortOption
  minRating: number
  selectedYear: number | undefined
  selectedLanguage: string
  onOpenShow: (id: number) => void
  onToggleFavoriteTV: (show: TVShow) => void
  onGenreSelect: (id: number | null) => void
  onSortChange: (value: SortOption) => void
  onMinRatingChange: (value: number) => void
  onYearChange: (value: number | undefined) => void
  onLanguageChange: (value: string) => void
  onLoadMore: () => void
}

/**
 * TV discovery section: hero, trending + top-rated carousels, discover grid with filters.
 */
export default function TVBrowseSection({
  trendingShows,
  topRatedShows,
  discoverShows,
  tvTrendingLoading,
  tvTopRatedLoading,
  tvDiscoverLoading,
  tvDiscoverError,
  tvGenres,
  tvGenresLoading,
  hasNextTVDiscover,
  favoriteIds,
  selectedGenre,
  sortBy,
  minRating,
  selectedYear,
  selectedLanguage,
  onOpenShow,
  onToggleFavoriteTV,
  onGenreSelect,
  onSortChange,
  onMinRatingChange,
  onYearChange,
  onLanguageChange,
  onLoadMore,
}: TVBrowseSectionProps) {
  const featuredShow = trendingShows.find(s => !!s.backdrop_path) ?? trendingShows[0]

  return (
    <div className={styles.page}>
      <TVHeroSection
        show={featuredShow}
        isLoading={tvTrendingLoading}
        onOpenShow={onOpenShow}
      />

      <div className={styles.content}>
        <TVCarousel
          title="Trending Today"
          shows={trendingShows}
          isLoading={tvTrendingLoading}
          onOpenShow={onOpenShow}
          favorites={favoriteIds}
          onToggleFavorite={onToggleFavoriteTV}
        />

        <TVCarousel
          title="Top Rated"
          shows={topRatedShows}
          isLoading={tvTopRatedLoading}
          onOpenShow={onOpenShow}
          favorites={favoriteIds}
          onToggleFavorite={onToggleFavoriteTV}
        />

        <section className={styles.section} aria-labelledby="tv-discover-title">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="tv-discover-title">
              Discover
            </h2>
            <SortDropdown value={sortBy} onChange={onSortChange} />
          </div>

          {/* TV genre filter */}
          <div className={styles.genreTrack} role="group" aria-label="Filter by genre">
            {tvGenresLoading
              ? Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className={styles.chipSkeleton}
                    style={{ width: `${60 + (i % 3) * 20}px` }}
                    aria-hidden="true"
                  />
                ))
              : [{ id: null as number | null, name: 'All' }, ...tvGenres].map(genre => (
                  <button
                    key={genre.id ?? 'all'}
                    type="button"
                    className={`${styles.chip} ${selectedGenre === genre.id ? styles.chipActive : ''}`}
                    onClick={() => onGenreSelect(genre.id)}
                    aria-pressed={selectedGenre === genre.id}
                  >
                    {genre.name}
                  </button>
                ))}
          </div>

          <AdvancedFilters
            minRating={minRating}
            onMinRatingChange={onMinRatingChange}
            year={selectedYear}
            onYearChange={onYearChange}
            language={selectedLanguage}
            onLanguageChange={onLanguageChange}
          />
          {tvDiscoverError && (
            <ErrorAlert
              message="Failed to load discover results."
              onRetry={onLoadMore}
            />
          )}
          <TVGrid
            shows={discoverShows}
            isLoading={tvDiscoverLoading}
            error={tvDiscoverError}
            hasNextPage={hasNextTVDiscover}
            onOpenShow={onOpenShow}
            onLoadMore={onLoadMore}
            favorites={favoriteIds}
            onToggleFavorite={onToggleFavoriteTV}
          />
        </section>
      </div>
    </div>
  )
}
