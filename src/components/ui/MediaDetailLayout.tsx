import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  getPosterUrl,
  getProfileUrl,
  getReleaseYear,
  formatRuntime,
  formatRating,
  formatCurrency,
  getYouTubeEmbedUrl,
} from '@/lib/helpers'
import Button from '@/components/ui/Button'
import IconButton from '@/components/ui/IconButton'
import Skeleton from '@/components/ui/Skeleton'
import type { Genre, CastMember } from '@/features/movies/types/movie'
import styles from './MediaDetailLayout.module.css'

// ─── Helper functions ──────────────────────────────────────────────

/** Format runtime minutes into "Xh Ym" string. Falls back to formatRuntime from helpers. */
function fmtRuntime(mins: number | null | undefined): string {
  return formatRuntime(mins)
}

/** Format large currency values: "$X.XM" (millions) or "$X.XB" (billions). */
function fmtCurrency(n: number): string {
  return formatCurrency(n)
}

/** Map a TV show status string to its corresponding CSS modifier class. */
function statusClass(status: string): string {
  if (status === 'Returning Series' || status === 'In Production') return styles.statusGreen
  if (status === 'Ended') return styles.statusGray
  if (status === 'Canceled') return styles.statusRed
  return styles.statusGray
}

// ─── Prop interfaces ───────────────────────────────────────────────

/** Normalised shape common to both movies and TV shows. */
export interface MediaDetailData {
  id: number
  /** Normalised title: `movie.title` or `show.name` */
  title: string
  tagline?: string | null
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  /** Normalised release date: `movie.release_date` or `show.first_air_date` */
  releaseDate: string
  vote_average: number
  genres: Genre[]
  trailerKey?: string | null
  cast?: CastMember[]
}

/** Movie-specific extras rendered in the details column. */
export interface MovieExtras {
  runtime?: number | null
  budget?: number
  revenue?: number
  productionCompanies?: { id: number; name: string }[]
}

/** TV-specific extras rendered in the details column. */
export interface TVExtras {
  status?: string
  numberOfSeasons?: number
  numberOfEpisodes?: number
  episodeRuntime?: number | null
  createdBy?: { id: number; name: string }[]
  networks?: { id: number; name: string }[]
}

/**
 * Props for the shared MediaDetailLayout component.
 *
 * The `recommendations` slot accepts a pre-rendered ReactNode so each
 * caller can supply the appropriate card component (MovieCard / TVCard)
 * without this layout needing to know about either.
 */
export interface MediaDetailLayoutProps {
  /** Distinguishes movie vs TV for conditional rendering of extras. */
  mediaType: 'movie' | 'tv'
  /** Normalised data common to both media types. `null` while loading. */
  data: MediaDetailData | null
  isLoading: boolean
  error: Error | null
  /** Movie-specific details (runtime, budget, revenue, production companies). */
  movieExtras?: MovieExtras
  /** TV-specific details (status, seasons, episodes, networks, creators). */
  tvExtras?: TVExtras
  /**
   * Pre-rendered recommendations grid.
   * When provided, it is wrapped in a labelled `<section>`.
   * Pass `null` or `undefined` to suppress the section entirely.
   */
  recommendations?: ReactNode
  isFavorite: boolean
  isInWatchlist: boolean
  isWatched: boolean
  onToggleFavorite: () => void
  onToggleWatchlist: () => void
  onToggleWatched: () => void
}

/**
 * MediaDetailLayout — shared full-page detail layout for movies and TV shows.
 *
 * Layout (top to bottom):
 * 1. Hero backdrop with gradient overlay
 * 2. Content area: poster + action buttons (left) / metadata (right)
 *    - Title, tagline, status badge (TV), meta row, overview
 *    - Created By + Networks (TV only)
 *    - Budget / Revenue + Production Companies (movie only)
 * 3. Trailer section (conditional on trailerKey)
 * 4. Cast section (conditional on cast length)
 * 5. Recommendations section (conditional on recommendations prop)
 */
export default function MediaDetailLayout({
  mediaType,
  data,
  isLoading,
  error,
  movieExtras,
  tvExtras,
  recommendations,
  isFavorite,
  isInWatchlist,
  isWatched,
  onToggleFavorite,
  onToggleWatchlist,
  onToggleWatched,
}: MediaDetailLayoutProps) {
  const navigate = useNavigate()

  const cast = data?.cast ?? []
  const trailerKey = data?.trailerKey ?? null

  const trailerIdPrefix = mediaType === 'movie' ? 'movie' : 'tv'

  if (error) {
    const label =
      mediaType === 'movie' ? 'Failed to load movie details' : 'Failed to load TV show details'
    return (
      <div className={styles.errorState} role="alert">
        <span className={styles.errorIcon}>⚠</span>
        <p className={styles.errorText}>{label}</p>
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
        ) : (() => {
          const heroSrc = data?.backdrop_path
            ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
            : data?.poster_path
              ? `https://image.tmdb.org/t/p/w780${data.poster_path}`
              : null
          const isPosterFallback = !data?.backdrop_path && !!data?.poster_path
          return heroSrc ? (
            <img
              src={heroSrc}
              alt=""
              className={`${styles.heroImg}${isPosterFallback ? ` ${styles.heroImgPoster}` : ''}`}
              loading="eager"
              decoding="async"
            />
          ) : null
        })()}
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
                src={getPosterUrl(data?.poster_path ?? null, 'md')}
                alt={data ? `${data.title} poster` : ''}
                className={styles.poster}
                loading="eager"
              />
            )}

            {data && (
              <Tooltip.Provider delayDuration={300}>
                <div className={styles.actions}>
                  {/* Favorite */}
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <IconButton
                        size="md"
                        active={isFavorite}
                        onClick={onToggleFavorite}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        aria-pressed={isFavorite}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M10 17.5S2 12.5 2 7a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 5.5-8 10.5-8 10.5z"
                            fill={isFavorite ? 'currentColor' : 'none'}
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </IconButton>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className={styles.tooltipContent} side="bottom" sideOffset={6}>
                        {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>

                  {/* Watchlist */}
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <IconButton
                        size="md"
                        active={isInWatchlist}
                        onClick={onToggleWatchlist}
                        aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                        aria-pressed={isInWatchlist}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <path d="M5 2h10a1 1 0 0 1 1 1v15l-6-3-6 3V3a1 1 0 0 1 1-1z"
                            fill={isInWatchlist ? 'currentColor' : 'none'}
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </IconButton>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className={styles.tooltipContent} side="bottom" sideOffset={6}>
                        {isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>

                  {/* Watched */}
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <IconButton
                        size="md"
                        success={isWatched}
                        onClick={onToggleWatched}
                        aria-label={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                        aria-pressed={isWatched}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <circle cx="10" cy="10" r="8"
                            fill={isWatched ? 'currentColor' : 'none'}
                            stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M6.5 10l2.5 2.5 4.5-4.5"
                            stroke={isWatched ? 'var(--color-bg)' : 'currentColor'}
                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </IconButton>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className={styles.tooltipContent} side="bottom" sideOffset={6}>
                        {isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </div>
              </Tooltip.Provider>
            )}
          </aside>

          {/* Right column: metadata */}
          <div className={styles.details}>
            {isLoading ? (
              <DetailSkeleton />
            ) : data ? (
              <>
                {/* Title + tagline */}
                <h1 className={styles.title}>{data.title}</h1>
                {data.tagline && <p className={styles.tagline}>"{data.tagline}"</p>}

                {/* Status badge — TV only */}
                {mediaType === 'tv' && tvExtras?.status && (
                  <span className={`${styles.statusBadge} ${statusClass(tvExtras.status)}`}>
                    {tvExtras.status}
                  </span>
                )}

                {/* Meta row */}
                <div
                  className={styles.meta}
                  aria-label={mediaType === 'movie' ? 'Movie metadata' : 'Show metadata'}
                >
                  <span className={styles.metaItem}>{getReleaseYear(data.releaseDate)}</span>

                  {/* Movie: runtime */}
                  {mediaType === 'movie' && movieExtras?.runtime != null && (
                    <span className={styles.metaItem}>{fmtRuntime(movieExtras.runtime)}</span>
                  )}

                  {/* TV: seasons + episodes + episode runtime */}
                  {mediaType === 'tv' && tvExtras?.numberOfSeasons != null && (
                    <span className={styles.metaItem}>
                      {tvExtras.numberOfSeasons}{' '}
                      {tvExtras.numberOfSeasons === 1 ? 'Season' : 'Seasons'}
                    </span>
                  )}
                  {mediaType === 'tv' && tvExtras?.numberOfEpisodes != null && (
                    <span className={styles.metaItem}>
                      {tvExtras.numberOfEpisodes} Episodes
                    </span>
                  )}
                  {mediaType === 'tv' && tvExtras?.episodeRuntime != null && (
                    <span className={styles.metaItem}>
                      {fmtRuntime(tvExtras.episodeRuntime)}/ep
                    </span>
                  )}

                  <span
                    className={styles.ratingBadge}
                    aria-label={`Rating: ${formatRating(data.vote_average)} out of 10`}
                  >
                    ★ {formatRating(data.vote_average)}
                  </span>

                  {data.genres.map(g => (
                    <span key={g.id} className={styles.genreChip}>
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Overview */}
                {data.overview && <p className={styles.overview}>{data.overview}</p>}

                {/* TV only: Created By */}
                {mediaType === 'tv' &&
                  tvExtras?.createdBy != null &&
                  tvExtras.createdBy.length > 0 && (
                    <div className={styles.infoBlock}>
                      <p className={styles.infoLabel}>Created By</p>
                      <p className={styles.infoValue}>
                        {tvExtras.createdBy.map(c => c.name).join(', ')}
                      </p>
                    </div>
                  )}

                {/* TV only: Networks */}
                {mediaType === 'tv' &&
                  tvExtras?.networks != null &&
                  tvExtras.networks.length > 0 && (
                    <div className={styles.infoBlock}>
                      <p className={styles.infoLabel}>Networks</p>
                      <p className={styles.infoValue}>
                        {tvExtras.networks.map(n => n.name).join(', ')}
                      </p>
                    </div>
                  )}

                {/* Movie only: Budget / Revenue */}
                {mediaType === 'movie' &&
                  ((movieExtras?.budget ?? 0) > 0 || (movieExtras?.revenue ?? 0) > 0) && (
                    <dl className={styles.financials}>
                      {(movieExtras?.budget ?? 0) > 0 && (
                        <div className={styles.financialItem}>
                          <dt className={styles.financialLabel}>Budget</dt>
                          <dd className={styles.financialValue}>
                            {fmtCurrency(movieExtras!.budget!)}
                          </dd>
                        </div>
                      )}
                      {(movieExtras?.revenue ?? 0) > 0 && (
                        <div className={styles.financialItem}>
                          <dt className={styles.financialLabel}>Revenue</dt>
                          <dd className={styles.financialValue}>
                            {fmtCurrency(movieExtras!.revenue!)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}

                {/* Movie only: Production companies */}
                {mediaType === 'movie' &&
                  movieExtras?.productionCompanies != null &&
                  movieExtras.productionCompanies.length > 0 && (
                    <div className={styles.companies}>
                      <p className={styles.companiesLabel}>Production</p>
                      <p className={styles.companiesList}>
                        {movieExtras.productionCompanies.map(c => c.name).join(', ')}
                      </p>
                    </div>
                  )}
              </>
            ) : null}
          </div>
        </div>

        {/* ── Trailer section ── */}
        {trailerKey && (
          <section
            className={styles.section}
            aria-labelledby={`${trailerIdPrefix}-trailer-heading`}
          >
            <h2
              className={styles.sectionTitle}
              id={`${trailerIdPrefix}-trailer-heading`}
            >
              Trailer
            </h2>
            <div className={styles.trailerWrapper}>
              <iframe
                src={getYouTubeEmbedUrl(trailerKey).replace('autoplay=1', 'autoplay=0')}
                title={data ? `${data.title} — Official Trailer` : 'Trailer'}
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
          <section
            className={styles.section}
            aria-labelledby={`${trailerIdPrefix}-cast-heading`}
          >
            <h2 className={styles.sectionTitle} id={`${trailerIdPrefix}-cast-heading`}>
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
        {recommendations != null && (
          <section
            className={styles.section}
            aria-labelledby={`${trailerIdPrefix}-recommendations-heading`}
          >
            <h2
              className={styles.sectionTitle}
              id={`${trailerIdPrefix}-recommendations-heading`}
            >
              You May Also Like
            </h2>
            <div className={styles.recommendationsGrid} role="list">
              {recommendations}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

/** Skeleton layout for the right-column details while loading. */
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
