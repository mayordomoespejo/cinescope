import { NavLink, useLocation } from 'react-router-dom'
import styles from './BottomNav.module.css'

const tabs = [
  {
    label: 'Home',
    to: '/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'TV Shows',
    to: '/tv',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    label: 'Favorites',
    to: '/favorites',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

function useActiveTab(to: string): boolean {
  const location = useLocation()
  if (to === '/') {
    return location.pathname === '/' || location.pathname.startsWith('/movie')
  }
  return location.pathname.startsWith(to)
}

function TabItem({ label, to, icon }: { label: string; to: string; icon: React.ReactNode }) {
  const active = useActiveTab(to)

  return (
    <NavLink
      to={to}
      className={`${styles.item} ${active ? styles.itemActive : ''}`}
      aria-label={label}
      end={to === '/'}
    >
      {icon}
    </NavLink>
  )
}

export default function BottomNav() {
  return (
    <nav className={styles.bar} aria-label="Mobile navigation">
      {tabs.map(tab => (
        <TabItem key={tab.to} label={tab.label} to={tab.to} icon={tab.icon} />
      ))}
    </nav>
  )
}
