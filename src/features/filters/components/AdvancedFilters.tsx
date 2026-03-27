import styles from './AdvancedFilters.module.css'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => CURRENT_YEAR - i)

const LANGUAGES = [
  { value: '', label: 'Any language' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'it', label: 'Italian' },
]

/** Props for the AdvancedFilters component. */
interface AdvancedFiltersProps {
  minRating: number
  onMinRatingChange: (value: number) => void
  year: number | undefined
  onYearChange: (value: number | undefined) => void
  language: string
  onLanguageChange: (value: string) => void
}

/**
 * @description Panel with advanced filtering controls: minimum rating slider, release year selector, and language selector.
 * @param props - Component props
 */
export default function AdvancedFilters({
  minRating,
  onMinRatingChange,
  year,
  onYearChange,
  language,
  onLanguageChange,
}: AdvancedFiltersProps) {
  return (
    <div className={styles.wrapper} role="group" aria-label="Advanced filters">
      {/* Rating slider */}
      <div className={styles.filterItem}>
        <label className={styles.label} htmlFor="rating-slider">
          Min rating:{' '}
          <span className={styles.ratingValue}>
            {minRating.toFixed(1)}
            <span className={styles.star} aria-hidden="true">
              ★
            </span>
          </span>
        </label>
        <input
          id="rating-slider"
          type="range"
          className={styles.slider}
          min={0}
          max={10}
          step={0.5}
          value={minRating}
          onChange={e => onMinRatingChange(Number(e.target.value))}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={minRating}
          aria-valuetext={`${minRating.toFixed(1)} stars minimum`}
        />
      </div>

      {/* Year select */}
      <div className={styles.filterItem}>
        <label className={styles.label} htmlFor="year-select">
          Year
        </label>
        <select
          id="year-select"
          className={styles.select}
          value={year ?? ''}
          onChange={e => onYearChange(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Any year</option>
          {YEARS.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Language select */}
      <div className={styles.filterItem}>
        <label className={styles.label} htmlFor="language-select">
          Language
        </label>
        <select
          id="language-select"
          className={styles.select}
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
