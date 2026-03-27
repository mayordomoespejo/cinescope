import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePersonDetail } from '@/features/movies/hooks/usePersonDetail'
import { usePersonMovieCredits } from '@/features/movies/hooks/usePersonMovieCredits'
import { getProfileUrl, getPosterUrl, formatDate, getReleaseYear } from '@/lib/helpers'
import type { PersonCastCredit, PersonCrewCredit } from '@/features/movies/types/movie'
import styles from './PersonPage.module.css'

type FilmographyTab = 'acting' | 'directing' | 'writing'

/** Mini poster card for "Known For" carousel and filmography grids */
export function MiniPosterCard({
  id,
  title,
  posterPath,
  releaseDate,
  subtitle,
  onClick,
}: {
  id: number
  title: string
  posterPath: string | null
  releaseDate: string
  subtitle?: string
  onClick: (id: number) => void
}) {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <article
      className={styles.miniCard}
      onClick={() => onClick(id)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(id)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${title}, ${getReleaseYear(releaseDate)}`}
    >
      <div className={styles.miniPosterWrapper}>
        {!imgLoaded && <div className={styles.miniPosterSkeleton} aria-hidden="true" />}
        <img
          src={getPosterUrl(posterPath, 'sm')}
          alt={title}
          className={`${styles.miniPoster} ${imgLoaded ? styles.miniPosterLoaded : ''}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
        />
      </div>
      <p className={styles.miniCardTitle}>{title}</p>
      {subtitle && <p className={styles.miniCardSub}>{subtitle}</p>}
    </article>
  )
}

/** Skeleton loader for the person page */
export function PersonPageSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBackdropSkeleton} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.profileSkeleton} aria-hidden="true" />
          <div className={styles.heroInfo}>
            <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonMeta}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonMeta}`} />
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.skeletonSection}>
          <div className={`${styles.skeletonLine} ${styles.skeletonSectionTitle}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonBio}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonBio}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonBioShort}`} />
        </div>
        <div className={styles.skeletonSection}>
          <div className={`${styles.skeletonLine} ${styles.skeletonSectionTitle}`} />
          <div className={styles.skeletonCarousel}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={`skeleton-card-${i}`} className={styles.skeletonMiniCard} aria-hidden="true" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * PersonPage — full detail page for a TMDB person.
 * Displays hero with profile photo, biography, "Known For" carousel,
 * and tabbed filmography (Acting / Directing / Writing).
 */
export default function PersonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const personId = id ? parseInt(id, 10) : null

  const { data: person, isLoading: personLoading, error: personError } = usePersonDetail(personId)
  const { data: credits, isLoading: creditsLoading } = usePersonMovieCredits(personId)

  const [bioExpanded, setBioExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<FilmographyTab>('acting')

  const isLoading = personLoading || creditsLoading

  if (isLoading) return <PersonPageSkeleton />

  if (personError || !person) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorTitle}>Person not found</p>
        <p className={styles.errorSub}>
          We could not find the person you are looking for. They may have been removed or the link
          may be incorrect.
        </p>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    )
  }

  const handleMovieClick = (movieId: number) => {
    navigate(`/movie/${movieId}`)
  }

  // Known For: top 8 cast credits sorted by popularity
  const knownFor: PersonCastCredit[] = credits
    ? [...credits.cast].sort((a, b) => b.popularity - a.popularity).slice(0, 8)
    : []

  // Filmography tabs
  const actingCredits: PersonCastCredit[] = credits
    ? [...credits.cast].sort((a, b) => {
        const dateA = a.release_date ?? ''
        const dateB = b.release_date ?? ''
        return dateB.localeCompare(dateA)
      })
    : []

  const directingCredits: PersonCrewCredit[] = credits
    ? credits.crew
        .filter(c => c.job === 'Director')
        .sort((a, b) => {
          const dateA = a.release_date ?? ''
          const dateB = b.release_date ?? ''
          return dateB.localeCompare(dateA)
        })
    : []

  const writingCredits: PersonCrewCredit[] = credits
    ? credits.crew
        .filter(c => c.job === 'Writer' || c.job === 'Screenplay' || c.department === 'Writing')
        .sort((a, b) => {
          const dateA = a.release_date ?? ''
          const dateB = b.release_date ?? ''
          return dateB.localeCompare(dateA)
        })
    : []

  // Biography display
  const bioLines = person.biography
    ? person.biography.split('\n').filter(l => l.trim().length > 0)
    : []
  const shortBio = bioLines.slice(0, 3).join('\n')
  const hasLongBio = bioLines.length > 3 || (person.biography && person.biography.length > 400)

  // Birthday / deathday display
  const birthdayFormatted = person.birthday
    ? `${formatDate(person.birthday)}${person.place_of_birth ? ` · ${person.place_of_birth}` : ''}`
    : null
  const deathdayFormatted = person.deathday ? formatDate(person.deathday) : null

  // Backdrop from first known-for movie (for the hero blur effect)
  const backdropPoster = knownFor[0]?.poster_path
    ? getPosterUrl(knownFor[0].poster_path, 'lg')
    : null

  const profileSrc = getProfileUrl(person.profile_path, 'lg')

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} aria-label={`${person.name} hero`}>
        {backdropPoster && (
          <div
            className={styles.heroBackdrop}
            style={{ backgroundImage: `url(${backdropPoster})` }}
            aria-hidden="true"
          />
        )}
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <div className={styles.profileWrapper}>
            <img
              src={profileSrc}
              alt={person.name}
              className={styles.profilePhoto}
              loading="eager"
              decoding="async"
            />
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.personName}>{person.name}</h1>
            {person.known_for_department && (
              <p className={styles.department}>{person.known_for_department}</p>
            )}
            {birthdayFormatted && (
              <p className={styles.metaLine}>
                <span className={styles.metaLabel}>Born</span> {birthdayFormatted}
              </p>
            )}
            {deathdayFormatted && (
              <p className={styles.metaLine}>
                <span className={styles.metaLabel}>Died</span> {deathdayFormatted}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className={styles.body}>
        {/* Biography */}
        <section className={styles.section} aria-labelledby="bio-heading">
          <h2 className={styles.sectionTitle} id="bio-heading">
            Biography
          </h2>
          {person.biography ? (
            <div className={styles.bioContainer}>
              <p
                className={`${styles.bioText} ${!bioExpanded && hasLongBio ? styles.bioCollapsed : ''}`}
              >
                {bioExpanded ? person.biography : shortBio}
              </p>
              {hasLongBio && (
                <button
                  type="button"
                  className={styles.readMoreBtn}
                  onClick={() => setBioExpanded(v => !v)}
                  aria-expanded={bioExpanded}
                >
                  {bioExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          ) : (
            <p className={styles.emptyState}>No biography available.</p>
          )}
        </section>

        {/* Known For */}
        {knownFor.length > 0 && (
          <section className={styles.section} aria-labelledby="known-for-heading">
            <h2 className={styles.sectionTitle} id="known-for-heading">
              Known For
            </h2>
            <div className={styles.carousel} role="list">
              {knownFor.map(credit => (
                <div key={`${credit.id}-${credit.character}`} role="listitem">
                  <MiniPosterCard
                    id={credit.id}
                    title={credit.title}
                    posterPath={credit.poster_path}
                    releaseDate={credit.release_date}
                    subtitle={credit.character}
                    onClick={handleMovieClick}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filmography */}
        <section className={styles.section} aria-labelledby="filmography-heading">
          <h2 className={styles.sectionTitle} id="filmography-heading">
            Filmography
          </h2>

          {/* Tabs */}
          <div className={styles.tabs} role="tablist" aria-label="Filmography categories">
            {(['acting', 'directing', 'writing'] as FilmographyTab[]).map(tab => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tabpanel-${tab}`}
                id={`tab-${tab}`}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className={styles.tabCount}>
                  {tab === 'acting'
                    ? actingCredits.length
                    : tab === 'directing'
                      ? directingCredits.length
                      : writingCredits.length}
                </span>
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div
            role="tabpanel"
            id="tabpanel-acting"
            aria-labelledby="tab-acting"
            hidden={activeTab !== 'acting'}
          >
            {activeTab === 'acting' && (
              <FilmographyGrid
                credits={actingCredits}
                subtitle={c => c.character}
                onMovieClick={handleMovieClick}
              />
            )}
          </div>

          <div
            role="tabpanel"
            id="tabpanel-directing"
            aria-labelledby="tab-directing"
            hidden={activeTab !== 'directing'}
          >
            {activeTab === 'directing' && (
              <FilmographyGrid
                credits={directingCredits}
                subtitle={c => c.job}
                onMovieClick={handleMovieClick}
              />
            )}
          </div>

          <div
            role="tabpanel"
            id="tabpanel-writing"
            aria-labelledby="tab-writing"
            hidden={activeTab !== 'writing'}
          >
            {activeTab === 'writing' && (
              <FilmographyGrid
                credits={writingCredits}
                subtitle={c => c.job}
                onMovieClick={handleMovieClick}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

/** Grid of poster cards for a filmography tab */
export function FilmographyGrid<T extends { id: number; title: string; poster_path: string | null; release_date: string },>({
  credits,
  subtitle,
  onMovieClick,
}: {
  credits: T[]
  subtitle: (credit: T) => string
  onMovieClick: (id: number) => void
}) {
  if (credits.length === 0) {
    return <p className={styles.emptyState}>No credits in this category.</p>
  }

  return (
    <div className={styles.filmographyGrid}>
      {credits.map((credit, idx) => (
        <MiniPosterCard
          key={`${credit.id}-${idx}`}
          id={credit.id}
          title={credit.title}
          posterPath={credit.poster_path}
          releaseDate={credit.release_date}
          subtitle={`${subtitle(credit)}${credit.release_date ? ` · ${getReleaseYear(credit.release_date)}` : ''}`}
          onClick={onMovieClick}
        />
      ))}
    </div>
  )
}
