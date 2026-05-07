import type { ButtonHTMLAttributes, Ref } from 'react'
import { Slot } from '@radix-ui/react-slot'
import styles from './IconButton.module.css'

/** Square icon-only button. `state` controls visual indicator: 'active' = accent, 'success' = green. Supports `asChild` via Radix Slot. */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>
  /** 'xs' = 30px (card), 'sm' = 36px (navbar), 'md' = 42px (detail). Default: 'md' */
  size?: 'xs' | 'sm' | 'md'
  /** Visual state: 'active' = accent color, 'success' = green */
  state?: 'active' | 'success'
  /** Glass variant: semi-transparent dark bg + backdrop-filter (for use over images) */
  glass?: boolean
  /** Render as child element (e.g. NavLink) using Radix Slot */
  asChild?: boolean
}

function IconButton({
  ref,
  size = 'md',
  state,
  glass = false,
  asChild = false,
  className,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? Slot : 'button'

  const sizeClassMap = { xs: styles.iconBtnXs, sm: styles.iconBtnSm, md: styles.iconBtnMd }
  const sizeClass = sizeClassMap[size]

  const classes = [
    styles.iconBtn,
    sizeClass,
    state === 'active' ? styles.iconBtnActive : '',
    state === 'success' ? styles.iconBtnSuccess : '',
    glass ? styles.iconBtnGlass : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return <Comp ref={ref} type={asChild ? undefined : 'button'} className={classes} {...props} />
}

export default IconButton
