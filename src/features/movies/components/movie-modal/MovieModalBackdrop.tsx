import { getBackdropUrl } from '@/lib/helpers'
import styles from './MovieModalBackdrop.module.css'

interface MovieModalBackdropProps {
  backdropPath: string | null
}

/**
 * Renders the full-width backdrop image and gradient overlay at the top of the
 * movie modal. When no backdrop path is provided the area shows the surface
 * fallback colour defined by the CSS module.
 */
export default function MovieModalBackdrop({ backdropPath }: MovieModalBackdropProps) {
  return (
    <div className={styles.backdrop}>
      {backdropPath && (
        <img
          src={getBackdropUrl(backdropPath, 'lg')}
          alt=""
          className={styles.backdropImg}
          loading="eager"
        />
      )}
      <div className={styles.backdropGradient} aria-hidden="true" />
    </div>
  )
}
