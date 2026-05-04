import type { CSSProperties } from 'react'
import styles from './SkeletonBlock.module.css'

/** Props for the SkeletonBlock loading placeholder. */
export interface SkeletonBlockProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
}

/**
 * @description Animated loading placeholder block. Renders an aria-hidden span
 * with configurable dimensions. The shimmer animation is defined once in
 * global.css and referenced here via the `.skeleton` utility class.
 */
export default function SkeletonBlock({
  width = '100%',
  height = '1rem',
  borderRadius,
  className = '',
}: SkeletonBlockProps) {
  const cssVars = {
    '--skeleton-w': typeof width === 'number' ? `${width}px` : width,
    '--skeleton-h': typeof height === 'number' ? `${height}px` : height,
    ...(borderRadius !== undefined && { '--skeleton-radius': borderRadius }),
  } as CSSProperties

  return <span className={`${styles.skeleton} ${className}`} style={cssVars} aria-hidden="true" />
}
