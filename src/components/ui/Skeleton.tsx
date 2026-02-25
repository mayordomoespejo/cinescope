import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
}

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
