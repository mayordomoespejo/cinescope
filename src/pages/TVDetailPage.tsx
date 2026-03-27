import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTVDetail } from '@/features/tv/hooks/useTVDetail'
import { useTVVideos } from '@/features/tv/hooks/useTVVideos'
import { useTVCredits } from '@/features/tv/hooks/useTVCredits'
import { useTVRecommendations } from '@/features/tv/hooks/useTVRecommendations'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import {
  getBackdropUrl,
  getPosterUrl,
  getProfileUrl,
  getReleaseYear,
  formatRuntime,
  formatRating,
  getYouTubeEmbedUrl,
} from '@/lib/helpers'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import TVCard from '@/features/tv/components/TVCard'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShowDetail } from '@/features/tv/types/tv'
import styles from './TVDetailPage.module.css'

/** Map a TVShowDetail to the shape expected by useFavorites (which uses Movie type). */
function tvShowAsMovie(show: TVShowDetail): Movie {
  return {
    id: show.id,
    title: show.name,
    overview: show.overview,
    poster_path: show.poster_path,
    backdrop_path: show.backdrop_path,
    release_date: show.first_air_date,
    vote_average: show.vote_average,
    vote_count: show.vote_count,
    genre_ids: show.genres.map(g => g.id),
    original_language: show.original_language,
    popularity: show.popularity,
  } as Movie
}

/** Color class for the show status badge. */
function statusClass(status: string): string {
  if (status === 'Returning Series' || status === 'In Production') return styles.statusGreen
  if (status === 'Ended') return styles.statusGray
  if (status === 'Canceled') return styles.statusRed
  return styles.statusGray
}

/**
 * TVDetailPage — full-page TV show detail view at /tv/:id.
 *
 * Layout (top to bottom):
 * 1. Hero backdrop with gradient overlay
 * 2. Content area: poster + action buttons (left) / metadata (right)
 *    - Metadata: name, year, seasons, episodes, episode runtime, rating, genres
 *    - Status badge (color-coded: green/gray/red)
 *    - Overview
 *    - Created By (from created_by array)
 *    - Networks (from networks array)
 * 3. Trailer section (YouTube embed via useTVVideos / pickTrailer)
 * 4. Cast row (horizontal scroll, max 12 members)
 * 5. Recommendations grid (max 12, TVCard)
 */
export default function TVDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tvId = id ? parseInt(id, 10) : null

  const { data: show, isLoading, error } = useTVDetail(tvId)
  const { data: videos } = useTVVideos(tvId)
  const { data: credits } = useTVCredits(tvId)
  const { data: recommendations } = useTVRecommendations(tvId)

  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist, isWatched, toggleWatched } =
    useFavorites()

  const trailer = videos?.trailer ?? null
  const cast = credits?.cast.slice(0, 12) ?? []
  const recommendedShows = recommendations?.results.slice(0, 12) ?? []

  const isFav = show ? isFavorite(show.id) : false
  const inWatchlist = show ? isInWatchlist(show.id) : false
  const watched = show ? isWatched(show.id) : false

  const episodeRuntime = show?.episode_run_time[0] ?? null

  if (error) {
    return (
      <div className={styles.errorState} role="alert">
        <span className={styles.errorIcon}>⚠</span>
        <p className={styles.errorText}>Failed to load TV show details</p>
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
          show?.backdrop_path && (
            <img
              src={getBackdropUrl(show.backdrop_path, 'original')}
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
                src={getPosterUrl(show?.poster_path ?? null, 'md')}
                alt={show ? `${show.name} poster` : ''}
                className={styles.poster}
                loading="eager"
              />
            )}

            {show && (
              <div className={styles.actions}>
                {/* Favorite */}
                <Button
                  variant={isFav ? 'danger' : 'secondary'}
                  size="md"
                  fullWidth
                  onClick={() => toggleFavorite(tvShowAsMovie(show))}
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
                  onClick={() => toggleWatchlist(tvShowAsMovie(show))}
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
                  onClick={() => toggleWatched(show.id)}
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
              <TVDetailSkeleton />
            ) : show ? (
              <>
                {/* Title + tagline */}
                <h1 className={styles.title}>{show.name}</h1>
                {show.tagline && <p className={styles.tagline}>"{show.tagline}"</p>}

                {/* Status badge */}
                <span className={`${styles.statusBadge} ${statusClass(show.status)}`}>
                  {show.status}
                </span>

                {/* Meta row */}
                <div className={styles.meta} aria-label="Show metadata">
                  <span className={styles.metaItem}>{getReleaseYear(show.first_air_date)}</span>
                  <span className={styles.metaItem}>
                    {show.number_of_seasons}{' '}
                    {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                  </span>
                  <span className={styles.metaItem}>
                    {show.number_of_episodes} Episodes
                  </span>
                  {episodeRuntime !== null && (
                    <span className={styles.metaItem}>{formatRuntime(episodeRuntime)}/ep</span>
                  )}
                  <span
                    className={styles.ratingBadge}
                    aria-label={`Rating: ${formatRating(show.vote_average)} out of 10`}
                  >
                    ★ {formatRating(show.vote_average)}
                  </span>
                  {show.genres.map(g => (
                    <span key={g.id} className={styles.genreChip}>
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Overview */}
                {show.overview && <p className={styles.overview}>{show.overview}</p>}

                {/* Created By */}
                {show.created_by.length > 0 && (
                  <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Created By</p>
                    <p className={styles.infoValue}>
                      {show.created_by.map(c => c.name).join(', ')}
                    </p>
                  </div>
                )}

                {/* Networks */}
                {show.networks.length > 0 && (
                  <div className={styles.infoBlock}>
                    <p className={styles.infoLabel}>Networks</p>
                    <p className={styles.infoValue}>
                      {show.networks.map(n => n.name).join(', ')}
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* ── Trailer section ── */}
        {trailer && (
          <section className={styles.section} aria-labelledby="tv-trailer-heading">
            <h2 className={styles.sectionTitle} id="tv-trailer-heading">
              Trailer
            </h2>
            <div className={styles.trailerWrapper}>
              <iframe
                src={getYouTubeEmbedUrl(trailer.key).replace('autoplay=1', 'autoplay=0')}
                title={show ? `${show.name} — Official Trailer` : 'Trailer'}
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
          <section className={styles.section} aria-labelledby="tv-cast-heading">
            <h2 className={styles.sectionTitle} id="tv-cast-heading">
              Cast
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
        {recommendedShows.length > 0 && (
          <section className={styles.section} aria-labelledby="tv-recommendations-heading">
            <h2 className={styles.sectionTitle} id="tv-recommendations-heading">
              You May Also Like
            </h2>
            <div className={styles.recommendationsGrid} role="list">
              {recommendedShows.map(rec => (
                <div key={rec.id} role="listitem">
                  <TVCard
                    show={rec}
                    onOpen={recId => navigate(`/tv/${recId}`)}
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
function TVDetailSkeleton() {
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
