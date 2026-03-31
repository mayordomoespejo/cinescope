import styles from './PageContent.module.css'

/** Props for PageContent */
interface PageContentProps {
  /** Page body elements to render inside the constrained wrapper. */
  children: React.ReactNode
  /** Optional extra CSS class applied to the wrapper div. */
  className?: string
}

/**
 * PageContent — centered, max-width content wrapper used by all page-level routes.
 */
export default function PageContent({ children, className }: PageContentProps) {
  return <div className={[styles.pageContent, className].filter(Boolean).join(' ')}>{children}</div>
}
