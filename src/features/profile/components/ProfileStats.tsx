import styles from './ProfileStats.module.css'

function AnimatedCounter({ value }: { value: number }) {
  return (
    <span
      key={value}
      className={`${styles.statValue} ${styles.statValueAnimate}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {value}
    </span>
  )
}

interface ProfileStatsProps {
  favoritesCount: number
  watchlistCount: number
  watchedCount: number
}

export function ProfileStats({ favoritesCount, watchlistCount, watchedCount }: ProfileStatsProps) {
  return (
    <section aria-label="Profile statistics" className={styles.statsRow}>
      <div className={styles.statTile}>
        <AnimatedCounter value={favoritesCount} />
        <span className={styles.statLabel}>Favorites</span>
      </div>
      <div className={styles.statTile}>
        <AnimatedCounter value={watchlistCount} />
        <span className={styles.statLabel}>Watchlist</span>
      </div>
      <div className={styles.statTile}>
        <AnimatedCounter value={watchedCount} />
        <span className={styles.statLabel}>Watched</span>
      </div>
    </section>
  )
}
