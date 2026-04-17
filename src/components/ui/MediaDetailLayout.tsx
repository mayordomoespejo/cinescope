import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import MediaDetailCast from '@/components/ui/media-detail/MediaDetailCast'
import MediaDetailHero from '@/components/ui/media-detail/MediaDetailHero'
import MediaDetailInfo from '@/components/ui/media-detail/MediaDetailInfo'
import MediaDetailPoster from '@/components/ui/media-detail/MediaDetailPoster'
import MediaDetailRecommendations from '@/components/ui/media-detail/MediaDetailRecommendations'
import MediaDetailTrailer from '@/components/ui/media-detail/MediaDetailTrailer'
import type { Genre, CastMember } from '@/features/movies/types/movie'
import styles from './MediaDetailLayout.module.css'

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
 * Orchestrates sub-components:
 * - MediaDetailHero: backdrop with gradient overlay
 * - MediaDetailPoster: poster + action buttons (favorite/watchlist/watched)
 * - MediaDetailInfo: title, meta, overview, financials, etc.
 * - MediaDetailTrailer: YouTube trailer embed (conditional)
 * - MediaDetailCast: cast row (conditional)
 * - MediaDetailRecommendations: recommendations grid (conditional)
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

  const cast = data?.cast ?? []
  const trailerKey = data?.trailerKey ?? null
  const idPrefix = mediaType === 'movie' ? 'movie' : 'tv'

  return (
    <div className={styles.page}>
      <MediaDetailHero
        isLoading={isLoading}
        backdropPath={data?.backdrop_path}
        posterPath={data?.poster_path}
      />

      <div className={styles.container}>
        <div className={styles.body}>
          <MediaDetailPoster
            isLoading={isLoading}
            posterPath={data?.poster_path}
            title={data?.title}
            isFavorite={isFavorite}
            isInWatchlist={isInWatchlist}
            isWatched={isWatched}
            onToggleFavorite={onToggleFavorite}
            onToggleWatchlist={onToggleWatchlist}
            onToggleWatched={onToggleWatched}
            showActions={data != null}
          />

          <div className={styles.details}>
            <MediaDetailInfo
              isLoading={isLoading}
              mediaType={mediaType}
              title={data?.title}
              tagline={data?.tagline}
              overview={data?.overview}
              releaseDate={data?.releaseDate}
              voteAverage={data?.vote_average}
              genres={data?.genres}
              movieExtras={movieExtras}
              tvExtras={tvExtras}
            />
          </div>
        </div>

        {trailerKey && (
          <MediaDetailTrailer trailerKey={trailerKey} title={data?.title} idPrefix={idPrefix} />
        )}

        <MediaDetailCast cast={cast} idPrefix={idPrefix} />

        {recommendations != null && (
          <MediaDetailRecommendations recommendations={recommendations} idPrefix={idPrefix} />
        )}
      </div>
    </div>
  )
}
