import styles from '../Navbar.module.css'
import IconButton from '../IconButton'

interface NavThemeToggleProps {
  theme: 'dark' | 'light'
  onToggle: () => void
}

/** Theme toggle button — switches between dark and light mode. */
export default function NavThemeToggle({ theme, onToggle }: NavThemeToggleProps) {
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  return (
    <IconButton
      size="sm"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={styles.themeToggle}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </IconButton>
  )
}
