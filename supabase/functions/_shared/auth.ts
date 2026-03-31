import { verifyFirebaseToken } from './firebaseAuth.ts'

/**
 * Extracts and verifies the Firebase Bearer token from the Authorization header.
 * Returns the user's Firebase UID on success, or throws on failure.
 */
export async function requireAuth(req: Request): Promise<string> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }
  const token = authHeader.slice(7)
  return await verifyFirebaseToken(token)
}
