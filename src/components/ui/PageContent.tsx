import styles from './PageContent.module.css'

interface PageContentProps {
  children: React.ReactNode
  className?: string
}

export default function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={[styles.pageContent, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
