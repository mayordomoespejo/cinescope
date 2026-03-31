import styles from './Skeleton.module.css'

/** Props for the Skeleton loading placeholder. */
interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
}

/**
 * @description Animated loading placeholder block. Renders an aria-hidden span with configurable dimensions.
 * @param props - Component props
 */
export default function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius,
  className = '',
}: SkeletonProps) {
  return (
    <span
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        display: 'block',
      }}
      aria-hidden="true"
    />
  )
}
