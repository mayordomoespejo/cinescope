import pageStyles from '@/pages/PersonPage.module.css'
import styles from './PersonBio.module.css'

export interface PersonBioProps {
  biography: string
}

/** Biography section — only rendered when biography is non-empty */
export function PersonBio({ biography }: PersonBioProps) {
  return (
    <section className={pageStyles.section} aria-labelledby="bio-heading">
      <h2 className={pageStyles.sectionTitle} id="bio-heading">
        Biography
      </h2>
      <div className={styles.bioContainer}>
        <p className={styles.bioText}>{biography}</p>
      </div>
    </section>
  )
}
