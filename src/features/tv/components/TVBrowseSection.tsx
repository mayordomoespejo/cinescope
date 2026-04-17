import { useBrowseFilters } from '@/hooks/browse/useBrowseFilters'
import { useTVData } from '@/hooks/browse/useTVData'
import { useBrowseHandlers } from '@/hooks/browse/useBrowseHandlers'
import TVHeroSection from './TVHeroSection'
import TVCarousel from './TVCarousel'
import TVGrid from './TVGrid'
import SortDropdown from '@/features/filters/components/SortDropdown'
import AdvancedFilters from '@/features/filters/components/AdvancedFilters'
import ErrorAlert from '@/components/ui/ErrorAlert'
import styles from '@/pages/BrowsePage.module.css'

/** Staggered skeleton chip width: 60 / 80 / 100 px cycling by index. */
const skeletonChipWidth = (i: number) => 60 + (i % 3) * 20

/**
 * TV discovery section: hero, trending + top-rated carousels, discover grid with filters.
 * Owns its own filter/data state — no prop drilling from parent.
 */
export default function TVBrowseSection() {
  const { filters, onGenreSelect, onSortChange, onMinRatingChange, onYearChange, onLanguageChange, onLoadMore } =
    useBrowseFilters()

  const {
    trendingShows,
    topRatedShows,
    discoverShows,
    featuredShow,
    tvTrendingLoading,
    tvTopRatedLoading,
    tvDiscoverLoading,
    tvDiscoverError,
    tvGenres,
    tvGenresLoading,
    hasNextTVDiscover,
  } = useTVData('tv', filters)

  const { favoriteIds, onOpenShow, onToggleFavorite } = useBrowseHandlers()

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
          onToggleFavorite={onToggleFavorite}
        />

        <TVCarousel
          title="Top Rated"
          shows={topRatedShows}
          isLoading={tvTopRatedLoading}
          onOpenShow={onOpenShow}
          favorites={favoriteIds}
          onToggleFavorite={onToggleFavorite}
        />

        <section className={styles.section} aria-labelledby="tv-discover-title">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="tv-discover-title">
              Discover
            </h2>
            <SortDropdown value={filters.sortBy} onChange={onSortChange} />
          </div>

          {/* TV genre filter */}
          <div className={styles.genreTrack} role="group" aria-label="Filter by genre">
            {tvGenresLoading
              ? Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className={styles.chipSkeleton}
                    style={{ width: `${skeletonChipWidth(i)}px` }}
                    aria-hidden="true"
                  />
                ))
              : [{ id: null as number | null, name: 'All' }, ...tvGenres].map(genre => (
                  <button
                    key={genre.id ?? 'all'}
                    type="button"
                    className={`${styles.chip} ${filters.genre === genre.id ? styles.chipActive : ''}`}
                    onClick={() => onGenreSelect(genre.id)}
                    aria-pressed={filters.genre === genre.id}
                  >
                    {genre.name}
                  </button>
                ))}
          </div>

          <AdvancedFilters
            minRating={filters.minRating}
            onMinRatingChange={onMinRatingChange}
            year={filters.year}
            onYearChange={onYearChange}
            language={filters.language}
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
            onToggleFavorite={onToggleFavorite}
          />
        </section>
      </div>
    </div>
  )
}
