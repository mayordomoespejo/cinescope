import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMovieDetail } from '@/features/movies/hooks/useMovieDetail'
import { useMovieVideos } from '@/features/movies/hooks/useMovieVideos'
import { useMovieCredits } from '@/features/movies/hooks/useMovieCredits'
import { useMovieRecommendations } from '@/features/movies/hooks/useMovieRecommendations'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import {
  getBackdropUrl,
  getPosterUrl,
  getProfileUrl,
  getReleaseYear,
  formatRuntime,
  formatRating,
  formatCurrency,
  getYouTubeEmbedUrl,
} from '@/lib/helpers'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import MovieCard from '@/features/movies/components/MovieCard'
import type { Movie, MovieDetail } from '@/features/movies/types/movie'
import styles from './MovieDetailPage.module.css'

/** Map a MovieDetail to the shape expected by useFavorites (which uses Movie type). */
function movieDetailAsBase(movie: MovieDetail): Movie {
  return { ...movie, genre_ids: movie.genres.map(g => g.id) } as Movie
}

/**
 * Full-page movie detail view, accessible at /movie/:id.
 *
 * Layout (top to bottom):
 * 1. Hero backdrop with gradient overlay
 * 2. Content area: poster + action buttons (left) / metadata (right)
 * 3. Trailer section (YouTube embed)
 * 4. Cast row (horizontal scroll, max 12 members)
 * 5. Recommendations grid
 */
export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const movieId = id ? parseInt(id, 10) : null

  const { data: movie, isLoading, error } = useMovieDetail(movieId)
  const { data: videos } = useMovieVideos(movieId)
  const { data: credits } = useMovieCredits(movieId)
  const { data: recommendations } = useMovieRecommendations(movieId)

  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist, isWatched, toggleWatched } =
    useFavorites()

  const trailer = videos?.trailer
  const cast = credits?.cast.slice(0, 12) ?? []
  const recommendedMovies = recommendations?.results ?? []

  const isFav = movie ? isFavorite(movie.id) : false
  const inWatchlist = movie ? isInWatchlist(movie.id) : false
  const watched = movie ? isWatched(movie.id) : false

  const movieAsBase = movie ? movieDetailAsBase(movie) : null

  if (error) {
    return (
      <div className={styles.errorState} role="alert">
        <span className={styles.errorIcon}>⚠</span>
        <p className={styles.errorText}>Failed to load movie details</p>
        <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* ── Hero backdrop ── */}
      <div className={styles.hero} aria-hidden="true">
        {isLoading ? (
          <Skeleton width="100%" height="100%" />
        ) : (
          movie?.backdrop_path && (
            <img
              src={getBackdropUrl(movie.backdrop_path, 'original')}
              alt=""
              className={styles.heroImg}
              loading="eager"
              decoding="async"
            />
          )
        )}
        <div className={styles.heroGradient} />
      </div>

      {/* ── Content area ── */}
      <div className={styles.container}>
        <div className={styles.body}>
          {/* Left column: poster + actions */}
          <aside className={styles.posterCol}>
            {isLoading ? (
              <Skeleton width="100%" height="420px" borderRadius="var(--radius-lg)" />
            ) : (
              <img
                src={getPosterUrl(movie?.poster_path ?? null, 'md')}
                alt={movie ? `${movie.title} poster` : ''}
                className={styles.poster}
                loading="eager"
              />
            )}

            {movie && (
              <div className={styles.actions}>
                {/* Favorite */}
                <Button
                  variant={isFav ? 'danger' : 'secondary'}
                  size="md"
                  fullWidth
                  onClick={() => movieAsBase && toggleFavorite(movieAsBase)}
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={isFav}
                >
                  {isFav ? '❤️ Favorited' : '🤍 Favorite'}
                </Button>

                {/* Watchlist */}
                <Button
                  variant={inWatchlist ? 'primary' : 'ghost'}
                  size="md"
                  fullWidth
                  onClick={() => movieAsBase && toggleWatchlist(movieAsBase)}
                  aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                  aria-pressed={inWatchlist}
                >
                  {inWatchlist ? '🔖 In Watchlist' : '🔖 Watchlist'}
                </Button>

                {/* Watched */}
                <Button
                  variant={watched ? 'primary' : 'ghost'}
                  size="md"
                  fullWidth
                  onClick={() => toggleWatched(movie.id)}
                  aria-label={watched ? 'Mark as unwatched' : 'Mark as watched'}
                  aria-pressed={watched}
                >
                  {watched ? '✅ Watched' : '✅ Mark watched'}
                </Button>
              </div>
            )}
          </aside>

          {/* Right column: metadata */}
          <div className={styles.details}>
            {isLoading ? (
              <DetailSkeleton />
            ) : movie ? (
              <>
                {/* Title + tagline */}
                <h1 className={styles.title}>{movie.title}</h1>
                {movie.tagline && <p className={styles.tagline}>"{movie.tagline}"</p>}

                {/* Meta row */}
                <div className={styles.meta} aria-label="Movie metadata">
                  <span className={styles.metaItem}>{getReleaseYear(movie.release_date)}</span>
                  {movie.runtime && (
                    <span className={styles.metaItem}>{formatRuntime(movie.runtime)}</span>
                  )}
                  <span
                    className={styles.ratingBadge}
                    aria-label={`Rating: ${formatRating(movie.vote_average)} out of 10`}
                  >
                    ★ {formatRating(movie.vote_average)}
                  </span>
                  {movie.genres.map(g => (
                    <span key={g.id} className={styles.genreChip}>
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Overview */}
                {movie.overview && <p className={styles.overview}>{movie.overview}</p>}

                {/* Budget / Revenue */}
                {(movie.budget > 0 || movie.revenue > 0) && (
                  <dl className={styles.financials}>
                    {movie.budget > 0 && (
                      <div className={styles.financialItem}>
                        <dt className={styles.financialLabel}>Budget</dt>
                        <dd className={styles.financialValue}>{formatCurrency(movie.budget)}</dd>
                      </div>
                    )}
                    {movie.revenue > 0 && (
                      <div className={styles.financialItem}>
                        <dt className={styles.financialLabel}>Revenue</dt>
                        <dd className={styles.financialValue}>{formatCurrency(movie.revenue)}</dd>
                      </div>
                    )}
                  </dl>
                )}

                {/* Production companies */}
                {movie.production_companies.length > 0 && (
                  <div className={styles.companies}>
                    <p className={styles.companiesLabel}>Production</p>
                    <p className={styles.companiesList}>
                      {movie.production_companies.map(c => c.name).join(', ')}
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* ── Trailer section ── */}
        {trailer && (
          <section className={styles.section} aria-labelledby="trailer-heading">
            <h2 className={styles.sectionTitle} id="trailer-heading">
              Tráiler
            </h2>
            <div className={styles.trailerWrapper}>
              <iframe
                src={getYouTubeEmbedUrl(trailer.key).replace('autoplay=1', 'autoplay=0')}
                title={movie ? `${movie.title} — Official Trailer` : 'Trailer'}
                className={styles.trailerIframe}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </section>
        )}

        {/* ── Cast section ── */}
        {cast.length > 0 && (
          <section className={styles.section} aria-labelledby="cast-heading">
            <h2 className={styles.sectionTitle} id="cast-heading">
              Reparto
            </h2>
            <div className={styles.castRow} role="list">
              {cast.map(member => (
                <Link
                  key={member.id}
                  to={`/person/${member.id}`}
                  className={styles.castCard}
                  role="listitem"
                  aria-label={`${member.name} as ${member.character}`}
                >
                  <img
                    src={getProfileUrl(member.profile_path, 'md')}
                    alt={member.name}
                    className={styles.castPhoto}
                    loading="lazy"
                    decoding="async"
                  />
                  <p className={styles.castName}>{member.name}</p>
                  <p className={styles.castCharacter}>{member.character}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Recommendations section ── */}
        {recommendedMovies.length > 0 && (
          <section className={styles.section} aria-labelledby="recommendations-heading">
            <h2 className={styles.sectionTitle} id="recommendations-heading">
              También te puede gustar
            </h2>
            <div className={styles.recommendationsGrid} role="list">
              {recommendedMovies.slice(0, 12).map(rec => (
                <div key={rec.id} role="listitem">
                  <MovieCard
                    movie={rec}
                    onOpen={recId => navigate(`/movie/${recId}`)}
                    isFavorite={isFavorite(rec.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

/** Skeleton layout for the right-column details while loading */
function DetailSkeleton() {
  return (
    <div className={styles.detailSkeleton} aria-hidden="true">
      <Skeleton height="2.5rem" width="70%" />
      <Skeleton height="1rem" width="45%" />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        {[80, 70, 90, 65, 75].map(w => (
          <Skeleton key={w} height="1.5rem" width={`${w}px`} borderRadius="var(--radius-full)" />
        ))}
      </div>
      <Skeleton height="0.9rem" width="100%" />
      <Skeleton height="0.9rem" width="92%" />
      <Skeleton height="0.9rem" width="85%" />
      <Skeleton height="0.9rem" width="78%" />
    </div>
  )
}
