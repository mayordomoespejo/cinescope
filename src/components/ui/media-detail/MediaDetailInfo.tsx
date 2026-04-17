import {
  getReleaseYear,
  formatRuntime,
  formatRating,
  formatMoney,
} from '@/lib/helpers'
import Skeleton from '@/components/ui/Skeleton'
import type { Genre } from '@/features/movies/types/movie'
import type { MovieExtras, TVExtras } from '../MediaDetailLayout'
import styles from './MediaDetailInfo.module.css'

interface MediaDetailInfoProps {
  isLoading: boolean
  mediaType: 'movie' | 'tv'
  title?: string
  tagline?: string | null
  overview?: string
  releaseDate?: string
  voteAverage?: number
  genres?: Genre[]
  movieExtras?: MovieExtras
  tvExtras?: TVExtras
}

/** Map a TV show status string to its corresponding CSS modifier class. */
function statusClass(status: string): string {
  if (status === 'Returning Series' || status === 'In Production') return styles.statusGreen
  if (status === 'Ended') return styles.statusGray
  if (status === 'Canceled') return styles.statusRed
  return styles.statusGray
}

export default function MediaDetailInfo({
  isLoading,
  mediaType,
  title,
  tagline,
  overview,
  releaseDate,
  voteAverage,
  genres = [],
  movieExtras,
  tvExtras,
}: MediaDetailInfoProps) {
  if (isLoading) {
    return <DetailSkeleton />
  }

  if (!title) return null

  return (
    <>
      {/* Title + tagline */}
      <h1 className={styles.title}>{title}</h1>
      {tagline && <p className={styles.tagline}>"{tagline}"</p>}

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
        {releaseDate && (
          <span className={styles.metaItem}>{getReleaseYear(releaseDate)}</span>
        )}

        {/* Movie: runtime */}
        {mediaType === 'movie' && movieExtras?.runtime != null && (
          <span className={styles.metaItem}>{formatRuntime(movieExtras.runtime)}</span>
        )}

        {/* TV: seasons + episodes + episode runtime */}
        {mediaType === 'tv' && tvExtras?.numberOfSeasons != null && (
          <span className={styles.metaItem}>
            {tvExtras.numberOfSeasons}{' '}
            {tvExtras.numberOfSeasons === 1 ? 'Season' : 'Seasons'}
          </span>
        )}
        {mediaType === 'tv' && tvExtras?.numberOfEpisodes != null && (
          <span className={styles.metaItem}>{tvExtras.numberOfEpisodes} Episodes</span>
        )}
        {mediaType === 'tv' && tvExtras?.episodeRuntime != null && (
          <span className={styles.metaItem}>
            {formatRuntime(tvExtras.episodeRuntime)}/ep
          </span>
        )}

        {voteAverage != null && (
          <span
            className={styles.ratingBadge}
            aria-label={`Rating: ${formatRating(voteAverage)} out of 10`}
          >
            ★ {formatRating(voteAverage)}
          </span>
        )}

        {genres.map(g => (
          <span key={g.id} className={styles.genreChip}>
            {g.name}
          </span>
        ))}
      </div>

      {/* Overview */}
      {overview && <p className={styles.overview}>{overview}</p>}

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
                  {movieExtras?.budget ? formatMoney(movieExtras.budget) : null}
                </dd>
              </div>
            )}
            {(movieExtras?.revenue ?? 0) > 0 && (
              <div className={styles.financialItem}>
                <dt className={styles.financialLabel}>Revenue</dt>
                <dd className={styles.financialValue}>
                  {movieExtras?.revenue ? formatMoney(movieExtras.revenue) : null}
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
  )
}

/** Skeleton layout for the right-column details while loading. */
function DetailSkeleton() {
  return (
    <div className={styles.detailSkeleton} aria-hidden="true">
      <Skeleton height="2.5rem" width="70%" />
      <Skeleton height="1rem" width="45%" />
      <div className={styles.skeletonChips}>
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
