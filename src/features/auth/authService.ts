import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  deleteUser,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './firebaseConfig'
import { edgeFunctionUrl, SUPABASE_FUNCTIONS } from '@/lib/supabaseFunctions'

const googleProvider = new GoogleAuthProvider()

/**
 * Signs in an existing user with email and password.
 * @param email - User email address.
 * @param password - User password.
 * @returns The signed-in Firebase User.
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

/**
 * Creates a new user account with email and password.
 * @param email - User email address.
 * @param password - User password.
 * @returns The newly created Firebase User.
 */
export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  return user
}

/**
 * Smart auth: attempts sign-up first; if the email already exists, falls back to sign-in.
 * This simplifies flows where the caller doesn't know whether the user has an account.
 * @param email - User email address.
 * @param password - User password.
 * @returns The Firebase User after sign-up or sign-in.
 */
export async function smartAuth(email: string, password: string): Promise<User> {
  try {
    return await signUpWithEmail(email, password)
  } catch (err: unknown) {
    const code = err instanceof Error && 'code' in err ? (err as { code: string }).code : ''
    if (code === 'auth/email-already-in-use') {
      return await signInWithEmail(email, password)
    }
    throw err
  }
}

/**
 * Opens a Google sign-in popup and authenticates the user via Google OAuth.
 * @returns The Firebase User returned by Google sign-in.
 */
export async function signInWithGoogle(): Promise<User> {
  const { user } = await signInWithPopup(auth, googleProvider)
  return user
}

/**
 * Re-authenticates the currently signed-in user via Google popup.
 * Use this before sensitive operations that require recent authentication.
 * @returns The re-authenticated Firebase User.
 */
export async function reauthenticateWithGoogle(): Promise<User> {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('No authenticated user to reauthenticate.')
  const { user } = await reauthenticateWithPopup(currentUser, googleProvider)
  return user
}

/**
 * Signs out the currently authenticated user from Firebase.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

/**
 * Deletes the current user's account:
 * 1. Removes all Supabase data via Edge Function
 * 2. Deletes the Firebase account
 * 3. Clears all cinescope:* localStorage keys
 * @param token - A fresh Firebase ID token for the current user.
 */
export async function deleteAccount(token: string): Promise<void> {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('No authenticated user')

  // 1. Delete all Supabase data via Edge Function
  const res = await fetch(edgeFunctionUrl(SUPABASE_FUNCTIONS.deleteAccount), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Server deletion failed: ${res.status}`)
  }

  // 2. Re-authenticate to satisfy Firebase's recent-login requirement, then delete
  await reauthenticateWithPopup(currentUser, googleProvider)
  await deleteUser(currentUser)

  // 3. Clear localStorage
  Object.keys(localStorage)
    .filter(k => k.startsWith('cinescope:'))
    .forEach(k => localStorage.removeItem(k))
}

/**
 * Subscribes to Firebase auth state changes.
 * The callback is invoked immediately with the current user, and again on every auth change.
 * @param callback - Function called with the current User (or null if signed out).
 * @returns An unsubscribe function to stop listening for changes.
 */
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, callback)
}
