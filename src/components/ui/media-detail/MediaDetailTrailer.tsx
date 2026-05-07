import { getYouTubeEmbedUrl } from '@/lib/videoUtils'
import styles from './MediaDetailTrailer.module.css'

interface MediaDetailTrailerProps {
  trailerKey: string
  title: string | undefined
  /** Prefix for the heading id to ensure uniqueness on page (e.g. "movie" | "tv"). */
  idPrefix: string
}

export default function MediaDetailTrailer({
  trailerKey,
  title,
  idPrefix,
}: MediaDetailTrailerProps) {
  const headingId = `${idPrefix}-trailer-heading`

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 className={styles.sectionTitle} id={headingId}>
        Trailer
      </h2>
      <div className={styles.trailerWrapper}>
        <iframe
          src={getYouTubeEmbedUrl(trailerKey).replace('autoplay=1', 'autoplay=0')}
          title={title ? `${title} — Official Trailer` : 'Trailer'}
          className={styles.trailerIframe}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </section>
  )
}
