import styles from './ErrorAlert.module.css'

/** Props for the ErrorAlert component. */
export interface ErrorAlertProps {
  message?: string
  onRetry?: () => void
}

/**
 * Inline error alert with an optional retry button.
 * Used wherever async operations fail and should surface the error to users.
 */
export default function ErrorAlert({
  message = 'Something went wrong.',
  onRetry,
}: ErrorAlertProps) {
  return (
    <div className={styles.alert} role="alert" aria-live="polite">
      <span className={styles.icon} aria-hidden="true">
        ⚠
      </span>
      <span className={styles.message}>{message}</span>
      {onRetry && (
        <button type="button" className={styles.retryBtn} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
