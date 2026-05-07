import type { ButtonHTMLAttributes, Ref } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

/** Reusable button with variants, sizes, and loading spinner. */
function Button({
  ref,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      <span className={loading ? styles.hiddenText : undefined}>{children}</span>
    </button>
  )
}

export default Button
