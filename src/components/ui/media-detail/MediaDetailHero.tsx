import Skeleton from '@/components/ui/Skeleton'
import { TMDB_IMAGE_BASE, IMAGE_SIZES } from '@/lib/config'
import styles from './MediaDetailHero.module.css'

interface MediaDetailHeroProps {
  isLoading: boolean
  backdropPath: string | null | undefined
  posterPath: string | null | undefined
}

export default function MediaDetailHero({
  isLoading,
  backdropPath,
  posterPath,
}: MediaDetailHeroProps) {
  const heroSrc = backdropPath
    ? `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.backdrop.original}${backdropPath}`
    : posterPath
      ? `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.backdrop.md}${posterPath}`
      : null
  const isPosterFallback = !backdropPath && !!posterPath

  return (
    <div className={styles.hero} aria-hidden="true">
      {isLoading ? (
        <Skeleton width="100%" height="100%" />
      ) : (
        heroSrc && (
          <img
            src={heroSrc}
            alt=""
            className={`${styles.heroImg}${isPosterFallback ? ` ${styles.heroImgPoster}` : ''}`}
            loading="eager"
            decoding="async"
          />
        )
      )}
      <div className={styles.heroGradient} />
    </div>
  )
}
