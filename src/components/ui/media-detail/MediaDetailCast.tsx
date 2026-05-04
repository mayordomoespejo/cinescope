import { Link } from 'react-router-dom'
import { getProfileUrl } from '@/lib/helpers'
import type { CastMember } from '@/features/movies/types/movie'
import styles from './MediaDetailCast.module.css'

interface MediaDetailCastProps {
  cast: CastMember[]
  /** Prefix for the heading id to ensure uniqueness on page (e.g. "movie" | "tv"). */
  idPrefix: string
}

export default function MediaDetailCast({ cast, idPrefix }: MediaDetailCastProps) {
  if (cast.length === 0) return null

  const headingId = `${idPrefix}-cast-heading`

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 className={styles.sectionTitle} id={headingId}>
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
  )
}
