import { getProfileUrl, formatDate } from '@/lib/helpers'
import type { PersonDetail } from '@/features/movies/types/movie'
import styles from './PersonHeader.module.css'

export interface PersonHeaderProps {
  person: PersonDetail
}

/** Profile header: photo, name, department, born/died meta */
export function PersonHeader({ person }: PersonHeaderProps) {
  const profileSrc = getProfileUrl(person.profile_path, 'lg')

  const birthdayFormatted = person.birthday
    ? `${formatDate(person.birthday)}${person.place_of_birth ? ` · ${person.place_of_birth}` : ''}`
    : null
  const deathdayFormatted = person.deathday ? formatDate(person.deathday) : null

  return (
    <div className={styles.profileHeader}>
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
  )
}
