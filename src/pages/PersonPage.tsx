import { useParams, useNavigate } from 'react-router-dom'
import { usePersonDetail } from '@/features/movies/hooks/usePersonDetail'
import { usePersonMovieCredits } from '@/features/movies/hooks/usePersonMovieCredits'
import { usePersonFilmography } from '@/features/movies/hooks/usePersonFilmography'
import { PersonHeader } from '@/features/movies/components/person/PersonHeader'
import { PersonBio } from '@/features/movies/components/person/PersonBio'
import { PersonFilmography } from '@/features/movies/components/person/PersonFilmography'
import PageContent from '@/components/ui/PageContent'
import styles from './PersonPage.module.css'

/** Skeleton loader for the person page */
export function PersonPageSkeleton() {
  return (
    <div className={styles.page}>
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
              <div
                key={`skeleton-card-${i}`}
                className={styles.skeletonMiniCard}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * PersonPage — full detail page for a TMDB person.
 * Displays profile photo + info, biography, "Known For" carousel,
 * and tabbed filmography (Acting / Directing / Writing).
 */
export default function PersonPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const personId = id ? parseInt(id, 10) : null

  const { data: person, isLoading: personLoading, error: personError } = usePersonDetail(personId)
  const { data: credits, isLoading: creditsLoading } = usePersonMovieCredits(personId)

  const { activeTab, setActiveTab, knownFor, actingCredits, directingCredits, writingCredits } =
    usePersonFilmography(credits)

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

  return (
    <div className={styles.page}>
      <PageContent className={styles.content}>
        <PersonHeader person={person} />

        {person.biography && <PersonBio biography={person.biography} />}

        <PersonFilmography
          knownFor={knownFor}
          actingCredits={actingCredits}
          directingCredits={directingCredits}
          writingCredits={writingCredits}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onMovieClick={handleMovieClick}
        />
      </PageContent>
    </div>
  )
}
