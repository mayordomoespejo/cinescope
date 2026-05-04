import { NavLink } from 'react-router-dom'
import styles from '../Navbar.module.css'
import iconBtnStyles from '../IconButton.module.css'

/** Favorites icon link — hidden on mobile (duplicated in BottomNav). */
export default function NavFavoritesLink() {
  return (
    <NavLink
      to="/favorites"
      aria-label="Favorites"
      className={({ isActive }) =>
        [
          iconBtnStyles.iconBtn,
          iconBtnStyles.iconBtnSm,
          isActive ? iconBtnStyles.iconBtnActive : '',
          styles.favLink,
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      {({ isActive }) => (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 17.5S2 12.5 2 7a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 5.5-8 10.5-8 10.5z"
            fill={isActive ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </NavLink>
  )
}
