import type { ReactNode } from 'react'
import styles from './MediaDetailRecommendations.module.css'

interface MediaDetailRecommendationsProps {
  recommendations: ReactNode
  /** Prefix for the heading id to ensure uniqueness on page (e.g. "movie" | "tv"). */
  idPrefix: string
}

export default function MediaDetailRecommendations({
  recommendations,
  idPrefix,
}: MediaDetailRecommendationsProps) {
  const headingId = `${idPrefix}-recommendations-heading`

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 className={styles.sectionTitle} id={headingId}>
        You May Also Like
      </h2>
      <div className={styles.recommendationsGrid} role="list">
        {recommendations}
      </div>
    </section>
  )
}
