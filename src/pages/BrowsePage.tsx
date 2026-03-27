import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useOutletContext } from '@/components/ui/LayoutContext'
import { useTrending } from '@/features/movies/hooks/useTrending'
import { useTopRated } from '@/features/movies/hooks/useTopRated'
import { useDiscover } from '@/features/movies/hooks/useDiscover'
import { useSearchMovies } from '@/features/movies/hooks/useSearch'
import { useMoviePrefetch } from '@/features/movies/hooks/useMoviePrefetch'
import { useTrendingTV } from '@/features/tv/hooks/useTrendingTV'
import { useTopRatedTV } from '@/features/tv/hooks/useTopRatedTV'
import { useDiscoverTV } from '@/features/tv/hooks/useDiscoverTV'
import { useSearchTV } from '@/features/tv/hooks/useSearchTV'
import { useTVGenres } from '@/features/tv/hooks/useTVGenres'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { addSearchQuery } from '@/features/favorites/store'
import HeroSection from '@/features/movies/components/HeroSection'
import MovieCarousel from '@/features/movies/components/MovieCarousel'
import MovieGrid from '@/features/movies/components/MovieGrid'
import TVHeroSection from '@/features/tv/components/TVHeroSection'
import TVCarousel from '@/features/tv/components/TVCarousel'
import TVGrid from '@/features/tv/components/TVGrid'
import GenreFilter from '@/features/filters/components/GenreFilter'
import SortDropdown from '@/features/filters/components/SortDropdown'
import AdvancedFilters from '@/features/filters/components/AdvancedFilters'
import type { SortOption } from '@/lib/config'
import type { LayoutContext } from '@/components/ui/LayoutContext'
import styles from './BrowsePage.module.css'

/** Props for the BrowsePage component. */
export interface BrowsePageProps {
  /** Determines which media domain (movies or TV shows) this page renders. */
  mediaType: 'movie' | 'tv'
}

/**
 * @description Shared browse page for movies and TV shows. Accepts a single
 * `mediaType` prop and internally selects the appropriate hooks and components.
 *
 * Layout (top to bottom):
 * 1. Hero — backdrop + CTA for the first trending item
 * 2. "Trending Today" carousel
 * 3. "Top Rated" carousel
 * 4. Discover section — genre filter chips, sort/advanced filters, grid, load-more
 *
 * Search mode: when `?q=` is present in the URL the normal layout is replaced
 * by a full-page results grid.
 *
 * @param props - Component props
 */
export default function BrowsePage({ mediaType }: BrowsePageProps) {
  const { onOpenMovie } = useOutletContext<LayoutContext>()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''

  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('popularity.desc')
  const [discoverPage, setDiscoverPage] = useState(1)
  const [minRating, setMinRating] = useState(0)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [selectedLanguage, setSelectedLanguage] = useState('')

  // ── Movie hooks ──────────────────────────────────────────────────────────
  const { prefetchMovieData } = useMoviePrefetch()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  const { data: movieTrendingData, isLoading: movieTrendingLoading } = useTrending('day')
  const { data: movieTopRatedData, isLoading: movieTopRatedLoading } = useTopRated()
  const {
    data: movieDiscoverData,
    isLoading: movieDiscoverLoading,
    error: movieDiscoverError,
  } = useDiscover(
    {
      with_genres: selectedGenre?.toString(),
      sort_by: sortBy,
      page: discoverPage,
      'vote_average.gte': minRating > 0 ? minRating : undefined,
      primary_release_year: selectedYear,
      with_original_language: selectedLanguage || undefined,
    },
    mediaType === 'movie' && !searchQuery
  )
  const {
    data: movieSearchData,
    isLoading: movieSearchLoading,
    error: movieSearchError,
  } = useSearchMovies(mediaType === 'movie' ? searchQuery : '')

  // ── TV hooks ─────────────────────────────────────────────────────────────
  const { data: tvGenres = [], isLoading: tvGenresLoading } = useTVGenres()

  const { data: tvTrendingData, isLoading: tvTrendingLoading } = useTrendingTV('day')
  const { data: tvTopRatedData, isLoading: tvTopRatedLoading } = useTopRatedTV()
  const {
    data: tvDiscoverData,
    isLoading: tvDiscoverLoading,
    error: tvDiscoverError,
  } = useDiscoverTV(
    {
      with_genres: selectedGenre?.toString(),
      sort_by: sortBy,
      page: discoverPage,
      'vote_average.gte': minRating > 0 ? minRating : undefined,
      first_air_date_year: selectedYear,
      with_original_language: selectedLanguage || undefined,
    },
    mediaType === 'tv' && !searchQuery
  )
  const {
    data: tvSearchData,
    isLoading: tvSearchLoading,
    error: tvSearchError,
  } = useSearchTV(mediaType === 'tv' ? searchQuery : '')

  useEffect(() => {
    if (searchQuery) addSearchQuery(searchQuery)
  }, [searchQuery])

  // ── Derived values ────────────────────────────────────────────────────────
  const favoriteIds = favorites.map(f => f.id)

  // Movie-derived
  const trendingMovies = movieTrendingData?.results ?? []
  const topRatedMovies = movieTopRatedData?.results ?? []
  const discoverMovies = movieDiscoverData?.results ?? []
  const searchMovies = movieSearchData?.results ?? []
  const hasNextMovieDiscover = discoverPage < (movieDiscoverData?.total_pages ?? 1)

  // TV-derived
  const trendingShows = tvTrendingData?.results ?? []
  const topRatedShows = tvTopRatedData?.results ?? []
  const discoverShows = tvDiscoverData?.results ?? []
  const searchShows = tvSearchData?.results ?? []
  const hasNextTVDiscover = discoverPage < (tvDiscoverData?.total_pages ?? 1)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenMovie = (id: number) => {
    onOpenMovie(id)
  }

  const handleOpenShow = (id: number) => {
    // TVCard navigates internally to /tv/:id; this callback is kept for API compatibility.
    void id
  }

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

  // ── Search mode ───────────────────────────────────────────────────────────
  if (searchQuery) {
    if (mediaType === 'movie') {
      return (
        <div className={styles.page}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Results for &ldquo;{searchQuery}&rdquo;
                {movieSearchData && (
                  <span className={styles.count}>
                    {movieSearchData.total_results === 1
                      ? '1 movie'
                      : `${movieSearchData.total_results} movies`}
                  </span>
                )}
              </h2>
            </div>
            <MovieGrid
              movies={searchMovies}
              isLoading={movieSearchLoading}
              error={movieSearchError}
              onOpenMovie={handleOpenMovie}
              onPrefetch={prefetchMovieData}
              favorites={favoriteIds}
              onToggleFavorite={toggleFavorite}
              emptyMessage={`No results for "${searchQuery}"`}
            />
          </div>
        </div>
      )
    }

    return (
      <div className={styles.page}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Results for &ldquo;{searchQuery}&rdquo;
              {tvSearchData && (
                <span className={styles.count}>
                  {tvSearchData.total_results === 1
                    ? '1 show'
                    : `${tvSearchData.total_results} shows`}
                </span>
              )}
            </h2>
          </div>
          <TVGrid
            shows={searchShows}
            isLoading={tvSearchLoading}
            error={tvSearchError}
            onOpenShow={handleOpenShow}
            emptyMessage={`No results for "${searchQuery}"`}
          />
        </div>
      </div>
    )
  }

  // ── Normal browse mode ────────────────────────────────────────────────────
  if (mediaType === 'movie') {
    return (
      <div className={styles.page}>
        {/* Hero */}
        <HeroSection
          movie={trendingMovies[0]}
          isLoading={movieTrendingLoading}
          onOpenMovie={handleOpenMovie}
          isFavorite={trendingMovies[0] ? isFavorite(trendingMovies[0].id) : false}
          onToggleFavorite={toggleFavorite}
        />

        <div className={styles.content}>
          {/* Trending carousel */}
          <MovieCarousel
            title="Trending Today"
            movies={trendingMovies}
            isLoading={movieTrendingLoading}
            onOpenMovie={handleOpenMovie}
            onPrefetch={prefetchMovieData}
            favorites={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />

          {/* Top Rated carousel */}
          <MovieCarousel
            title="Top Rated"
            movies={topRatedMovies}
            isLoading={movieTopRatedLoading}
            onOpenMovie={handleOpenMovie}
            onPrefetch={prefetchMovieData}
            favorites={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />

          {/* Discover section with filters */}
          <section className={styles.section} aria-labelledby="discover-title">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} id="discover-title">
                Discover
              </h2>
              <SortDropdown value={sortBy} onChange={handleSortChange} />
            </div>
            <GenreFilter selectedGenreId={selectedGenre} onSelect={handleGenreSelect} />
            <AdvancedFilters
              minRating={minRating}
              onMinRatingChange={handleMinRatingChange}
              year={selectedYear}
              onYearChange={handleYearChange}
              language={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
            <MovieGrid
              movies={discoverMovies}
              isLoading={movieDiscoverLoading}
              error={movieDiscoverError}
              hasNextPage={hasNextMovieDiscover}
              onOpenMovie={handleOpenMovie}
              onPrefetch={prefetchMovieData}
              onLoadMore={() => setDiscoverPage(p => p + 1)}
              favorites={favoriteIds}
              onToggleFavorite={toggleFavorite}
            />
          </section>
        </div>
      </div>
    )
  }

  // mediaType === 'tv'
  return (
    <div className={styles.page}>
      {/* Hero */}
      <TVHeroSection
        show={trendingShows[0]}
        isLoading={tvTrendingLoading}
        onOpenShow={handleOpenShow}
      />

      <div className={styles.content}>
        {/* Trending carousel */}
        <TVCarousel
          title="Trending Today"
          shows={trendingShows}
          isLoading={tvTrendingLoading}
          onOpenShow={handleOpenShow}
        />

        {/* Top Rated carousel */}
        <TVCarousel
          title="Top Rated"
          shows={topRatedShows}
          isLoading={tvTopRatedLoading}
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

          {/* TV genre filter — inline because GenreFilter uses the movie genres hook */}
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
            isLoading={tvDiscoverLoading}
            error={tvDiscoverError}
            hasNextPage={hasNextTVDiscover}
            onOpenShow={handleOpenShow}
            onLoadMore={() => setDiscoverPage(p => p + 1)}
          />
        </section>
      </div>
    </div>
  )
}
