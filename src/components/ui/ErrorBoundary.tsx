import { Component, type ReactNode, type ErrorInfo } from 'react'
import styles from './ErrorBoundary.module.css'

/** Props for the ErrorBoundary component. */
interface Props {
  children: ReactNode
  fallback?: ReactNode
  /** When true, also catches unhandled promise rejections and shows the fallback UI. */
  catchAsyncErrors?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * @description React class component that catches uncaught errors in its subtree and renders a fallback UI.
 * Optionally catches unhandled promise rejections when `catchAsyncErrors` is true.
 */
export default class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this)
  }

  componentDidMount(): void {
    if (this.props.catchAsyncErrors) {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection)
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection)
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
  }

  handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const reason = event.reason
    const error = reason instanceof Error ? reason : new Error(String(reason))
    this.setState({ hasError: true, error })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className={styles.container} role="alert">
            <div className={styles.icon} aria-hidden="true">
              ⚠
            </div>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.message}>
              An unexpected error occurred. Please reload the page and try again.
            </p>
            <button className={styles.reloadButton} onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
