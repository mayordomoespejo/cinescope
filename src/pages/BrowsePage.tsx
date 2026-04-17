import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
import { addSearchQuery } from '@/features/search/searchHistoryStore'
import MovieBrowseSection from '@/features/movies/components/MovieBrowseSection'
import TVBrowseSection from '@/features/tv/components/TVBrowseSection'
import SearchResults from '@/features/search/components/SearchResults'
import { tvShowToMovie } from '@/features/tv/adapters'
import type { SortOption } from '@/lib/config'
import type { LayoutContext } from '@/components/ui/LayoutContext'
import type { TVShow } from '@/features/tv/types/tv'

/** Props for the BrowsePage component. */
export interface BrowsePageProps {
  /** Determines which media domain (movies or TV shows) this page renders. */
  mediaType: 'movie' | 'tv'
}

/**
 * Thin coordinator page for movie and TV browsing.
 * Manages shared filter/pagination state and delegates rendering to
 * MovieBrowseSection, TVBrowseSection, or SearchResults.
 */
export default function BrowsePage({ mediaType }: BrowsePageProps) {
  const { onOpenMovie } = useOutletContext<LayoutContext>()
  const navigate = useNavigate()
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
  const { favorites, toggleFavorite } = useFavorites()

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
  const favoriteIds = useMemo(() => favorites.map(f => f.id), [favorites])

  const trendingMovies = movieTrendingData?.results ?? []
  const topRatedMovies = movieTopRatedData?.results ?? []
  const discoverMovies = movieDiscoverData?.results ?? []
  const searchMovies = movieSearchData?.results ?? []
  const hasNextMovieDiscover = discoverPage < (movieDiscoverData?.total_pages ?? 1)

  const trendingShows = tvTrendingData?.results ?? []
  const topRatedShows = tvTopRatedData?.results ?? []
  const discoverShows = tvDiscoverData?.results ?? []
  const searchShows = tvSearchData?.results ?? []
  const hasNextTVDiscover = discoverPage < (tvDiscoverData?.total_pages ?? 1)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenMovie = (id: number) => { onOpenMovie(id) }
  const handleOpenShow = (id: number) => { navigate(`/tv/${id}`) }

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

  const handleToggleFavoriteTV = (show: TVShow) => {
    void toggleFavorite(tvShowToMovie(show))
  }

  // ── Search mode ───────────────────────────────────────────────────────────
  if (searchQuery) {
    return (
      <SearchResults
        mediaType={mediaType}
        searchQuery={searchQuery}
        searchMovies={searchMovies}
        movieSearchLoading={movieSearchLoading}
        movieSearchError={movieSearchError}
        movieTotalResults={movieSearchData?.total_results}
        searchShows={searchShows}
        tvSearchLoading={tvSearchLoading}
        tvSearchError={tvSearchError}
        tvTotalResults={tvSearchData?.total_results}
        favoriteIds={favoriteIds}
        onOpenMovie={handleOpenMovie}
        onPrefetch={prefetchMovieData}
        onToggleFavorite={toggleFavorite}
        onOpenShow={handleOpenShow}
        onToggleFavoriteTV={handleToggleFavoriteTV}
      />
    )
  }

  // ── Normal browse mode ────────────────────────────────────────────────────
  if (mediaType === 'movie') {
    return (
      <MovieBrowseSection
        trendingMovies={trendingMovies}
        topRatedMovies={topRatedMovies}
        discoverMovies={discoverMovies}
        movieTrendingLoading={movieTrendingLoading}
        movieTopRatedLoading={movieTopRatedLoading}
        movieDiscoverLoading={movieDiscoverLoading}
        movieDiscoverError={movieDiscoverError}
        hasNextMovieDiscover={hasNextMovieDiscover}
        favoriteIds={favoriteIds}
        selectedGenre={selectedGenre}
        sortBy={sortBy}
        minRating={minRating}
        selectedYear={selectedYear}
        selectedLanguage={selectedLanguage}
        onOpenMovie={handleOpenMovie}
        onPrefetch={prefetchMovieData}
        onToggleFavorite={toggleFavorite}
        onGenreSelect={handleGenreSelect}
        onSortChange={handleSortChange}
        onMinRatingChange={handleMinRatingChange}
        onYearChange={handleYearChange}
        onLanguageChange={handleLanguageChange}
        onLoadMore={() => setDiscoverPage(p => p + 1)}
      />
    )
  }

  return (
    <TVBrowseSection
      trendingShows={trendingShows}
      topRatedShows={topRatedShows}
      discoverShows={discoverShows}
      tvTrendingLoading={tvTrendingLoading}
      tvTopRatedLoading={tvTopRatedLoading}
      tvDiscoverLoading={tvDiscoverLoading}
      tvDiscoverError={tvDiscoverError}
      tvGenres={tvGenres}
      tvGenresLoading={tvGenresLoading}
      hasNextTVDiscover={hasNextTVDiscover}
      favoriteIds={favoriteIds}
      selectedGenre={selectedGenre}
      sortBy={sortBy}
      minRating={minRating}
      selectedYear={selectedYear}
      selectedLanguage={selectedLanguage}
      onOpenShow={handleOpenShow}
      onToggleFavoriteTV={handleToggleFavoriteTV}
      onGenreSelect={handleGenreSelect}
      onSortChange={handleSortChange}
      onMinRatingChange={handleMinRatingChange}
      onYearChange={handleYearChange}
      onLanguageChange={handleLanguageChange}
      onLoadMore={() => setDiscoverPage(p => p + 1)}
    />
  )
}
