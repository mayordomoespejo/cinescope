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
  let heroSrc: string | null = null
  if (backdropPath) {
    heroSrc = `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.backdrop.original}${backdropPath}`
  } else if (posterPath) {
    heroSrc = `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.backdrop.md}${posterPath}`
  }
  const isPosterFallback = !backdropPath && !!posterPath
  const heroImgClass = isPosterFallback
    ? `${styles.heroImg} ${styles.heroImgPoster}`
    : styles.heroImg

  return (
    <div className={styles.hero} aria-hidden="true">
      {isLoading ? (
        <Skeleton width="100%" height="100%" />
      ) : (
        heroSrc && (
          <img src={heroSrc} alt="" className={heroImgClass} loading="eager" decoding="async" />
        )
      )}
      <div className={styles.heroGradient} />
    </div>
  )
}
