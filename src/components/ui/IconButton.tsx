import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import styles from './IconButton.module.css'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 'xs' = 30px (card), 'sm' = 36px (navbar), 'md' = 42px (detail). Default: 'md' */
  size?: 'xs' | 'sm' | 'md'
  /** Accent color active state (heart/bookmark) */
  active?: boolean
  /** Green success active state (watched) */
  success?: boolean
  /** Glass variant: semi-transparent dark bg + backdrop-filter (for use over images) */
  glass?: boolean
  /** Render as child element (e.g. NavLink) using Radix Slot */
  asChild?: boolean
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', active = false, success = false, glass = false, asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const classes = [
      styles.iconBtn,
      size === 'xs' ? styles.iconBtnXs : size === 'sm' ? styles.iconBtnSm : styles.iconBtnMd,
      active ? styles.iconBtnActive : '',
      success ? styles.iconBtnSuccess : '',
      glass ? styles.iconBtnGlass : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : 'button'}
        className={classes}
        {...props}
      />
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton
