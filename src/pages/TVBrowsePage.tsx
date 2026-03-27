import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTrendingTV } from '@/features/tv/hooks/useTrendingTV'
import { useTopRatedTV } from '@/features/tv/hooks/useTopRatedTV'
import { useDiscoverTV } from '@/features/tv/hooks/useDiscoverTV'
import { useSearchTV } from '@/features/tv/hooks/useSearchTV'
import { useTVGenres } from '@/features/tv/hooks/useTVGenres'
import { addSearchQuery } from '@/features/favorites/store'
import TVHeroSection from '@/features/tv/components/TVHeroSection'
import TVCarousel from '@/features/tv/components/TVCarousel'
import TVGrid from '@/features/tv/components/TVGrid'
import SortDropdown from '@/features/filters/components/SortDropdown'
import AdvancedFilters from '@/features/filters/components/AdvancedFilters'
import type { SortOption } from '@/lib/config'
import styles from './TVBrowsePage.module.css'

/**
 * TVBrowsePage — browsable TV show directory at /tv.
 *
 * Layout (top to bottom):
 * 1. TVHeroSection — backdrop + CTA for the first trending show
 * 2. "Trending Today" TVCarousel
 * 3. "Top Rated" TVCarousel
 * 4. Discover section — TVGrid with genre filter, SortDropdown, AdvancedFilters, load-more
 *
 * Search mode: when `?q=` is present in the URL, replaces the normal layout with
 * a full-page search results grid powered by useSearchTV.
 *
 * Note: useTVPrefetch does not exist in this codebase. TVCard navigates internally
 * to /tv/:id, so prefetch is intentionally omitted.
 *
 * Note: GenreFilter uses the movie genres hook internally. A custom inline TV genre
 * filter is used here instead, backed by useTVGenres.
 */
export default function TVBrowsePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''

  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('popularity.desc')
  const [discoverPage, setDiscoverPage] = useState(1)
  const [minRating, setMinRating] = useState(0)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [selectedLanguage, setSelectedLanguage] = useState('')

  const { data: tvGenres = [], isLoading: genresLoading } = useTVGenres()

  // Data fetching
  const { data: trendingData, isLoading: trendingLoading } = useTrendingTV('day')
  const { data: topRatedData, isLoading: topRatedLoading } = useTopRatedTV()
  const {
    data: discoverData,
    isLoading: discoverLoading,
    error: discoverError,
  } = useDiscoverTV(
    {
      with_genres: selectedGenre?.toString(),
      sort_by: sortBy,
      page: discoverPage,
      'vote_average.gte': minRating > 0 ? minRating : undefined,
      first_air_date_year: selectedYear,
      with_original_language: selectedLanguage || undefined,
    },
    !searchQuery
  )
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useSearchTV(searchQuery)

  const handleOpenShow = (id: number) => {
    navigate(`/tv/${id}`)
  }

  useEffect(() => {
    if (searchQuery) addSearchQuery(searchQuery)
  }, [searchQuery])

  const trendingShows = trendingData?.results ?? []
  const topRatedShows = topRatedData?.results ?? []
  const discoverShows = discoverData?.results ?? []
  const searchShows = searchData?.results ?? []
  const hasNextDiscover = discoverPage < (discoverData?.total_pages ?? 1)

  const handleGenreSelect = (id: number | null) => {
    setSelectedGenre(id)
    setDiscoverPage(1)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    setDiscoverPage(1)
  }

  const handleMinRatingChange = (value: number) => {
    setMinRating(value)
    setDiscoverPage(1)
  }

  const handleYearChange = (value: number | undefined) => {
    setSelectedYear(value)
    setDiscoverPage(1)
  }

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
    setDiscoverPage(1)
  }

  // Search mode
  if (searchQuery) {
    return (
      <div className={styles.page}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Results for "{searchQuery}"
              {searchData && (
                <span className={styles.count}>
                  {searchData.total_results === 1
                    ? '1 show'
                    : `${searchData.total_results} shows`}
                </span>
              )}
            </h2>
          </div>
          <TVGrid
            shows={searchShows}
            isLoading={searchLoading}
            error={searchError}
            onOpenShow={handleOpenShow}
            emptyMessage={`No results for "${searchQuery}"`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <TVHeroSection
        show={trendingShows[0]}
        isLoading={trendingLoading}
        onOpenShow={handleOpenShow}
      />

      <div className={styles.content}>
        {/* Trending carousel */}
        <TVCarousel
          title="Trending Today"
          shows={trendingShows}
          isLoading={trendingLoading}
          onOpenShow={handleOpenShow}
        />

        {/* Top Rated carousel */}
        <TVCarousel
          title="Top Rated"
          shows={topRatedShows}
          isLoading={topRatedLoading}
          onOpenShow={handleOpenShow}
        />

        {/* Discover section with filters */}
        <section className={styles.section} aria-labelledby="tv-discover-title">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} id="tv-discover-title">
              Discover
            </h2>
            <SortDropdown value={sortBy} onChange={handleSortChange} />
          </div>

          {/* TV Genre filter — inline because GenreFilter uses movie genres hook */}
          <div className={styles.genreTrack} role="group" aria-label="Filter by genre">
            {genresLoading
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
                    onClick={() => handleGenreSelect(genre.id)}
                    aria-pressed={selectedGenre === genre.id}
                  >
                    {genre.name}
                  </button>
                ))}
          </div>

          <AdvancedFilters
            minRating={minRating}
            onMinRatingChange={handleMinRatingChange}
            year={selectedYear}
            onYearChange={handleYearChange}
            language={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
          <TVGrid
            shows={discoverShows}
            isLoading={discoverLoading}
            error={discoverError}
            hasNextPage={hasNextDiscover}
            onOpenShow={handleOpenShow}
            onLoadMore={() => setDiscoverPage(p => p + 1)}
          />
        </section>
      </div>
    </div>
  )
}
