import * as Select from '@radix-ui/react-select'
import styles from './AdvancedFilters.module.css'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => CURRENT_YEAR - i)

const LANGUAGES = [
  { value: '__all__', label: 'Any language' },
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

/** Chevron icon for the select trigger */
function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 4l4 4 4-4" />
    </svg>
  )
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
  const yearValue = year !== undefined ? String(year) : '__all__'
  const yearLabel = year !== undefined ? String(year) : 'Any year'

  const languageValue = language !== '' ? language : '__all__'
  const languageLabel =
    LANGUAGES.find(l => l.value === language || (language === '' && l.value === '__all__'))
      ?.label ?? 'Any language'

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
        <label className={styles.label} id="year-select-label">
          Year
        </label>
        <Select.Root
          value={yearValue}
          onValueChange={val => onYearChange(val === '__all__' ? undefined : Number(val))}
        >
          <Select.Trigger className={styles.trigger} aria-labelledby="year-select-label">
            <Select.Value>{yearLabel}</Select.Value>
            <span className={styles.chevron}>
              <ChevronIcon />
            </span>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className={styles.selectContent} position="popper" sideOffset={6}>
              <Select.Viewport>
                <Select.Item value="__all__" className={styles.selectItem}>
                  <span className={styles.checkmark} aria-hidden="true">
                    ✓
                  </span>
                  <Select.ItemText>Any year</Select.ItemText>
                </Select.Item>
                {YEARS.map(y => (
                  <Select.Item key={y} value={String(y)} className={styles.selectItem}>
                    <span className={styles.checkmark} aria-hidden="true">
                      ✓
                    </span>
                    <Select.ItemText>{y}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Language select */}
      <div className={styles.filterItem}>
        <label className={styles.label} id="language-select-label">
          Language
        </label>
        <Select.Root
          value={languageValue}
          onValueChange={val => onLanguageChange(val === '__all__' ? '' : val)}
        >
          <Select.Trigger className={styles.trigger} aria-labelledby="language-select-label">
            <Select.Value>{languageLabel}</Select.Value>
            <span className={styles.chevron}>
              <ChevronIcon />
            </span>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className={styles.selectContent} position="popper" sideOffset={6}>
              <Select.Viewport>
                {LANGUAGES.map(lang => (
                  <Select.Item key={lang.value} value={lang.value} className={styles.selectItem}>
                    <span className={styles.checkmark} aria-hidden="true">
                      ✓
                    </span>
                    <Select.ItemText>{lang.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  )
}
