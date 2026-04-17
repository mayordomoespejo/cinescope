import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { User } from 'firebase/auth'
import IconButton from './IconButton'
import styles from './Navbar.module.css'

interface UserMenuProps {
  user: User
  onSignOut: () => void
}

function getInitials(user: User): string {
  if (user.displayName) {
    return user.displayName
      .split(' ')
      .map(s => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  if (user.email) return user.email[0].toUpperCase()
  return 'U'
}

/**
 * Avatar button that opens a Radix dropdown with user info and sign-out action.
 */
export default function UserMenu({ user, onSignOut }: UserMenuProps) {
  const initials = getInitials(user)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton
          aria-label="Open user menu"
          size="sm"
          className={styles.avatarBtn}
        >
          {initials}
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.dropdownContent}
          align="end"
          sideOffset={8}
        >
          <div className={styles.dropdownUserInfo}>
            <div className={styles.dropdownAvatar} aria-hidden="true">
              {initials}
            </div>
            <div className={styles.dropdownUserDetails}>
              {user.displayName && (
                <span className={styles.dropdownName}>{user.displayName}</span>
              )}
              {user.email && (
                <span className={styles.dropdownEmail}>{user.email}</span>
              )}
            </div>
          </div>

          <div className={styles.dropdownSeparator} role="separator" />

          <DropdownMenu.Item
            className={styles.dropdownItem}
            onSelect={onSignOut}
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
