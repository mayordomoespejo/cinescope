import { Link } from 'react-router-dom'
import type { User } from 'firebase/auth'
import styles from '../Navbar.module.css'
import UserMenu from '../UserMenu'

interface NavAuthSectionProps {
  user: User | null
  loading: boolean
  onSignOut: () => void
}

/** Auth section — shows UserMenu when signed in, or a Sign in link otherwise. */
export default function NavAuthSection({ user, loading, onSignOut }: NavAuthSectionProps) {
  if (loading) return null

  return user ? (
    <UserMenu user={user} onSignOut={onSignOut} />
  ) : (
    <Link to="/login" className={styles.signInBtn}>
      Sign in
    </Link>
  )
}
