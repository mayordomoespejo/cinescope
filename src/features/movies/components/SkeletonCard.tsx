import Skeleton from '@/components/ui/Skeleton'
import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <Skeleton height="100%" borderRadius="var(--radius-lg)" className={styles.poster} />
      <div className={styles.info}>
        <Skeleton height="0.85rem" width="80%" />
        <Skeleton height="0.75rem" width="50%" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 20 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  )
}
