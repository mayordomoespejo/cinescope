import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useOutletContext } from '@/components/ui/LayoutContext'
import { useQueryClient } from '@tanstack/react-query'
import { useTrending } from '@/features/movies/hooks/useTrending'
import { useTopRated } from '@/features/movies/hooks/useTopRated'
import { useDiscover } from '@/features/movies/hooks/useDiscover'
import { useSearchMovies } from '@/features/movies/hooks/useSearch'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { fetchMovieDetail } from '@/features/movies/api/tmdbApi'
import { fetchMovieVideosForQuery } from '@/features/movies/hooks/useMovieVideos'
import { queryKeys } from '@/lib/queryKeys'
import { addSearchQuery } from '@/features/favorites/store'
import HeroSection from '@/features/movies/components/HeroSection'
import MovieCarousel from '@/features/movies/components/MovieCarousel'
import MovieGrid from '@/features/movies/components/MovieGrid'
import GenreFilter from '@/features/filters/components/GenreFilter'
import SortDropdown from '@/features/filters/components/SortDropdown'
import type { SortOption } from '@/lib/config'
import type { LayoutContext } from '@/components/ui/LayoutContext'
import styles from './Home.module.css'

export default function Home() {
  const { onOpenMovie } = useOutletContext<LayoutContext>()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''

  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('popularity.desc')
  const [discoverPage, setDiscoverPage] = useState(1)

  const queryClient = useQueryClient()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  // Data fetching
  const { data: trendingData, isLoading: trendingLoading } = useTrending('day')
  const { data: topRatedData, isLoading: topRatedLoading } = useTopRated()
  const {
    data: discoverData,
    isLoading: discoverLoading,
    error: discoverError,
  } = useDiscover(
    { with_genres: selectedGenre?.toString(), sort_by: sortBy, page: discoverPage },
    !searchQuery
  )
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useSearchMovies(searchQuery)

  // Prefetch movie detail on card hover
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

  const handleOpenMovie = (id: number) => {
    onOpenMovie(id)
  }

  const handleSearch = (q: string) => {
    if (q) addSearchQuery(q)
  }

  // Compute data for displays
  const trendingMovies = trendingData?.results ?? []
  const topRatedMovies = topRatedData?.results ?? []
  const discoverMovies = discoverData?.results ?? []
  const searchMovies = searchData?.results ?? []
  const favoriteIds = favorites.map(f => f.id)

  // Discover: handle load more
  const hasNextDiscover = discoverPage < (discoverData?.total_pages ?? 1)

  const handleGenreSelect = (id: number | null) => {
    setSelectedGenre(id)
    setDiscoverPage(1)
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    setDiscoverPage(1)
  }

  // Search mode
  if (searchQuery) {
    void handleSearch(searchQuery)
    return (
      <div className={styles.page}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Results for "{searchQuery}"
              {searchData && (
                <span className={styles.count}>
                  {searchData.total_results === 1
                    ? '1 movie'
                    : `${searchData.total_results} movies`}
                </span>
              )}
            </h2>
          </div>
          <MovieGrid
            movies={searchMovies}
            isLoading={searchLoading}
            error={searchError}
            onOpenMovie={handleOpenMovie}
            onPrefetch={handlePrefetch}
            favorites={favoriteIds}
            onToggleFavorite={toggleFavorite}
            emptyMessage={searchQuery ? `No results for "${searchQuery}"` : undefined}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <HeroSection
        movie={trendingMovies[0]}
        isLoading={trendingLoading}
        onOpenMovie={handleOpenMovie}
        isFavorite={trendingMovies[0] ? isFavorite(trendingMovies[0].id) : false}
        onToggleFavorite={toggleFavorite}
      />

      <div className={styles.content}>
        {/* Trending carousel */}
        <MovieCarousel
          title="Trending Today"
          movies={trendingMovies}
          isLoading={trendingLoading}
          onOpenMovie={handleOpenMovie}
          onPrefetch={handlePrefetch}
          favorites={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />

        {/* Top Rated carousel */}
        <MovieCarousel
          title="Top Rated"
          movies={topRatedMovies}
          isLoading={topRatedLoading}
          onOpenMovie={handleOpenMovie}
          onPrefetch={handlePrefetch}
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
          <MovieGrid
            movies={discoverMovies}
            isLoading={discoverLoading}
            error={discoverError}
            hasNextPage={hasNextDiscover}
            onOpenMovie={handleOpenMovie}
            onPrefetch={handlePrefetch}
            onLoadMore={() => setDiscoverPage(p => p + 1)}
            favorites={favoriteIds}
            onToggleFavorite={toggleFavorite}
          />
        </section>
      </div>
    </div>
  )
}
