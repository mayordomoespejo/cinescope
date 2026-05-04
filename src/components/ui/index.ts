// Layout primitives
export { default as Layout } from './Layout'
export { default as PageContent } from './PageContent'
export { default as Navbar } from './navbar/Navbar'
export { default as BottomNav } from './BottomNav'
export { useOutletContext } from './LayoutContext'
export type { LayoutContext } from './LayoutContext'

// Buttons and inputs
export { default as Button } from './Button'
export { default as IconButton } from './IconButton'
export { default as Chip } from './Chip'

// Media
export { default as MediaCard } from './MediaCard'
export type { MediaCardProps } from './MediaCard'
export { default as MediaGrid } from './MediaGrid'
export type { MediaGridProps } from './MediaGrid'
export { mediaGridContainer, mediaGridItem } from './mediaGridVariants'
export { default as MediaDetailLayout } from './MediaDetailLayout'
export type {
  MediaDetailData,
  MovieExtras,
  TVExtras,
  MediaDetailLayoutProps,
} from './MediaDetailLayout'

// Skeletons
export { default as Skeleton } from './Skeleton'
export { default as SkeletonCard, SkeletonCardGrid } from './SkeletonCard'

// Feedback
export { ToastProvider, useToast } from './Toast'
export { default as ErrorBoundary } from './ErrorBoundary'

// Branding + misc
export { default as CinescopeLogo } from './CinescopeLogo'
export { default as ScrollToTop } from './ScrollToTop'
