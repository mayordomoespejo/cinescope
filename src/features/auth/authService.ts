import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './firebaseConfig'
import { supabase } from '../../lib/supabaseClient'

/**
 * Bridges a Firebase user session into Supabase so that RLS policies
 * using `auth.uid()::text = user_id` work correctly with Firebase UIDs.
 */
async function bridgeToSupabase(firebaseUser: User): Promise<void> {
  const token = await firebaseUser.getIdToken()
  await supabase.auth.signInWithIdToken({
    provider: 'firebase',
    token,
  })
}

const googleProvider = new GoogleAuthProvider()

/**
 * Signs in an existing user with email and password.
 * @param email - User email address.
 * @param password - User password.
 * @returns The signed-in Firebase User.
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  await bridgeToSupabase(user)
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
  await bridgeToSupabase(user)
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
    const code = (err as { code?: string }).code
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
  await bridgeToSupabase(user)
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
 * Signs out the currently authenticated user from both Firebase and Supabase.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
  await supabase.auth.signOut()
}

/**
 * Subscribes to Firebase auth state changes.
 * When a Firebase user is present but no Supabase session exists, re-bridges the token
 * so that RLS policies remain functional after page reloads or token refreshes.
 * The callback is invoked immediately with the current user, and again on every auth change.
 * @param callback - Function called with the current User (or null if signed out).
 * @returns An unsubscribe function to stop listening for changes.
 */
export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
  return firebaseOnAuthStateChanged(auth, async firebaseUser => {
    if (firebaseUser) {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        await bridgeToSupabase(firebaseUser)
      }
    }
    callback(firebaseUser)
  })
}
