import { useParams, useNavigate } from 'react-router-dom'
import { useTVDetail } from '@/features/tv/hooks/useTVDetail'
import { useTVVideos } from '@/features/tv/hooks/useTVVideos'
import { useTVCredits } from '@/features/tv/hooks/useTVCredits'
import { useTVRecommendations } from '@/features/tv/hooks/useTVRecommendations'
import { useFavorites } from '@/features/favorites/hooks/useFavorites'
import { useWatched } from '@/features/watched/useWatched'
import MediaDetailLayout from '@/components/ui/MediaDetailLayout'
import type { MediaDetailData, TVExtras } from '@/components/ui/MediaDetailLayout'
import TVCard from '@/features/tv/components/TVCard'
import type { Movie } from '@/features/movies/types/movie'
import type { TVShowDetail } from '@/features/tv/types/tv'

/** Map a TVShowDetail to the base Movie shape expected by useFavorites. */
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

/**
 * Full-page TV show detail view, accessible at /tv/:id.
 *
 * Thin wrapper around MediaDetailLayout — normalises TVShowDetail data
 * into the shared MediaDetailData shape and delegates all rendering.
 */
export default function TVDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tvId = id ? parseInt(id, 10) : null

  const { data: show, isLoading, error } = useTVDetail(tvId)
  const { data: videos } = useTVVideos(tvId)
  const { data: credits } = useTVCredits(tvId)
  const { data: recommendations } = useTVRecommendations(tvId)

  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useFavorites()
  const { isWatched, toggleWatched } = useWatched()

  const cast = credits?.cast.slice(0, 12) ?? []
  const trailerKey = videos?.trailer?.key ?? null
  const recommendedShows = recommendations?.results.slice(0, 12) ?? []

  const isFav = show ? isFavorite(show.id) : false
  const inWatchlist = show ? isInWatchlist(show.id) : false
  const watched = show ? isWatched(show.id, 'tv') : false

  const showAsMovie = show ? tvShowAsMovie(show) : null
  const episodeRuntime = show?.episode_run_time[0] ?? null

  // Normalise to MediaDetailData
  const data: MediaDetailData | null = show
    ? {
        id: show.id,
        title: show.name,
        tagline: show.tagline,
        overview: show.overview,
        poster_path: show.poster_path,
        backdrop_path: show.backdrop_path,
        releaseDate: show.first_air_date,
        vote_average: show.vote_average,
        genres: show.genres,
        trailerKey,
        cast,
      }
    : null

  const tvExtras: TVExtras = {
    status: show?.status,
    numberOfSeasons: show?.number_of_seasons,
    numberOfEpisodes: show?.number_of_episodes,
    episodeRuntime,
    createdBy: show?.created_by,
    networks: show?.networks,
  }

  // Recommendations slot
  const recommendationsSlot =
    recommendedShows.length > 0 ? (
      <>
        {recommendedShows.map(rec => (
          <TVCard key={rec.id} show={rec} onOpen={recId => navigate(`/tv/${recId}`)} />
        ))}
      </>
    ) : null

  return (
    <MediaDetailLayout
      mediaType="tv"
      data={data}
      isLoading={isLoading}
      error={error}
      tvExtras={tvExtras}
      recommendations={recommendationsSlot}
      isFavorite={isFav}
      isInWatchlist={inWatchlist}
      isWatched={watched}
      onToggleFavorite={() => showAsMovie && toggleFavorite(showAsMovie)}
      onToggleWatchlist={() => showAsMovie && toggleWatchlist(showAsMovie)}
      onToggleWatched={() =>
        show && toggleWatched({ media_id: show.id, media_type: 'tv', media_data: show })
      }
    />
  )
}
