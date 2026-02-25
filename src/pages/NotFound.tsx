import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className={styles.emoji} aria-hidden="true">
        🎬
      </span>
      <h1 className={styles.title}>404</h1>
      <p className={styles.subtitle}>Scene not found</p>
      <p className={styles.text}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/">
        <Button variant="primary" size="lg">
          Back to Home
        </Button>
      </Link>
    </motion.div>
  )
}
