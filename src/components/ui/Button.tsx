import { forwardRef } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
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
)

Button.displayName = 'Button'
export default Button
