// Components
export { default as AuthGuard } from './AuthGuard'
export { AuthModal } from './AuthModal'

// Hooks
export { useAuth } from './useAuth'

// Services
export {
  signInWithEmail,
  signUpWithEmail,
  smartAuth,
  signInWithGoogle,
  reauthenticateWithGoogle,
  signOut,
  deleteAccount,
  onAuthStateChanged,
} from './authService'

// Firebase
export { auth, firebaseApp } from './firebaseConfig'
