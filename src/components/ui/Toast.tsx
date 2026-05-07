import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import styles from './Toast.module.css'

// ── Types ────────────────────────────────────────────────────────────

interface ToastItem {
  id: number
  message: string
  exiting: boolean
}

interface ToastContextValue {
  showToast: (message: string) => void
}

// ── Context ──────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

const DISPLAY_DURATION = 2000
const EXIT_DURATION = 220

function makeExitingUpdater(id: number) {
  return (prev: ToastItem[]) => prev.map(t => (t.id === id ? { ...t, exiting: true } : t))
}

function makeRemoveFilter(id: number) {
  return (prev: ToastItem[]) => prev.filter(t => t.id !== id)
}

// ── Provider ─────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: number) => {
    // Start exit animation first
    setToasts(makeExitingUpdater(id))
    // Remove from DOM after animation
    const removeTimer = setTimeout(() => {
      setToasts(makeRemoveFilter(id))
      timers.current.delete(id)
    }, EXIT_DURATION)
    timers.current.set(id, removeTimer)
  }, [])

  const showToast = useCallback(
    (message: string) => {
      const id = ++nextId
      setToasts(prev => [...prev, { id, message, exiting: false }])

      const timer = setTimeout(() => removeToast(id), DISPLAY_DURATION)
      timers.current.set(id, timer)
    },
    [removeToast]
  )

  // Clean up all timers on unmount
  useEffect(() => {
    const t = timers.current
    return () => {
      t.forEach(clearTimeout)
      t.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className={styles.container} aria-live="polite" aria-atomic="false">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={styles.toast}
              data-exiting={toast.exiting ? 'true' : undefined}
              role="status"
            >
              <span className={styles.icon} aria-hidden="true">
                <CheckIcon />
              </span>
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): (message: string) => void {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx.showToast
}

// ── Internal icon ────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.5 7L5.5 10L11.5 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
