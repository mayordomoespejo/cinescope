import { useParams, useNavigate } from 'react-router-dom'
import { useMovieDetail } from '@/features/movies/hooks/useMovieDetail'
import { useMovieVideos } from '@/features/movies/hooks/useMovieVideos'
import { useMovieCredits } from '@/features/movies/hooks/useMovieCredits'
import { useMovieRecommendations } from '@/features/movies/hooks/useMovieRecommendations'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { useWatched } from '@/features/watched/useWatched'
import MediaDetailLayout from '@/components/ui/MediaDetailLayout'
import type { MediaDetailData, MovieExtras } from '@/components/ui/MediaDetailLayout'
import MovieCard from '@/features/movies/components/MovieCard'
import type { Movie, MovieDetail } from '@/features/movies/types/movie'

/** Map a MovieDetail to the base Movie shape expected by useFavorites. */
function movieDetailAsBase(movie: MovieDetail): Movie {
  return { ...movie, genre_ids: movie.genres.map(g => g.id) } as Movie
}

/**
 * Full-page movie detail view, accessible at /movie/:id.
 *
 * Thin wrapper around MediaDetailLayout — normalises MovieDetail data
 * into the shared MediaDetailData shape and delegates all rendering.
 */
export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const movieId = id ? parseInt(id, 10) : null

  const { data: movie, isLoading, error } = useMovieDetail(movieId)
  const { data: videos } = useMovieVideos(movieId)
  const { data: credits } = useMovieCredits(movieId)
  const { data: recommendations } = useMovieRecommendations(movieId)

  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useFavorites()
  const { isWatched, toggleWatched } = useWatched()

  const cast = credits?.cast.slice(0, 12) ?? []
  const trailerKey = videos?.trailer?.key ?? null
  const recommendedMovies = recommendations?.results.slice(0, 12) ?? []

  const isFav = movie ? isFavorite(movie.id) : false
  const inWatchlist = movie ? isInWatchlist(movie.id) : false
  const watched = movie ? isWatched(movie.id, 'movie') : false

  const movieAsBase = movie ? movieDetailAsBase(movie) : null

  // Normalise to MediaDetailData
  const data: MediaDetailData | null = movie
    ? {
        id: movie.id,
        title: movie.title,
        tagline: movie.tagline,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        releaseDate: movie.release_date,
        vote_average: movie.vote_average,
        genres: movie.genres,
        trailerKey,
        cast,
      }
    : null

  const movieExtras: MovieExtras = {
    runtime: movie?.runtime,
    budget: movie?.budget,
    revenue: movie?.revenue,
    productionCompanies: movie?.production_companies,
  }

  // Recommendations slot: rendered as individual listitem divs
  const recommendationsSlot =
    recommendedMovies.length > 0 ? (
      <>
        {recommendedMovies.map(rec => (
          <div key={rec.id} role="listitem">
            <MovieCard
              movie={rec}
              onOpen={recId => navigate(`/movie/${recId}`)}
              isFavorite={isFavorite(rec.id)}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        ))}
      </>
    ) : null

  return (
    <MediaDetailLayout
      mediaType="movie"
      data={data}
      isLoading={isLoading}
      error={error}
      movieExtras={movieExtras}
      recommendations={recommendationsSlot}
      isFavorite={isFav}
      isInWatchlist={inWatchlist}
      isWatched={watched}
      onToggleFavorite={() => movieAsBase && toggleFavorite(movieAsBase)}
      onToggleWatchlist={() => movieAsBase && toggleWatchlist(movieAsBase)}
      onToggleWatched={() =>
        movie &&
        toggleWatched({ media_id: movie.id, media_type: 'movie', media_data: movieDetailAsBase(movie) })
      }
    />
  )
}
