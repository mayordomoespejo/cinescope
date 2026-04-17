/** Maps Firebase Auth error codes to user-facing Spanish messages. */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/invalid-credential': 'Contraseña incorrecta',
  'auth/user-not-found': 'No existe una cuenta con este email',
  'auth/email-already-in-use': 'Ya existe una cuenta con este email',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento',
  'auth/network-request-failed': 'Error de red. Comprueba tu conexión',
  'auth/popup-closed-by-user': 'Ha ocurrido un error. Inténtalo de nuevo',
  'auth/cancelled-popup-request': 'Ha ocurrido un error. Inténtalo de nuevo',
}

const FALLBACK_MESSAGE = 'Ha ocurrido un error. Inténtalo de nuevo'

/**
 * Maps a Firebase Auth error code to a user-facing Spanish message.
 * Falls back to a generic message for unknown or empty codes.
 * @param code - Firebase Auth error code (e.g. 'auth/wrong-password').
 * @returns Localised error message string.
 */
export function mapFirebaseError(code: string): string {
  return FIREBASE_ERROR_MESSAGES[code] ?? FALLBACK_MESSAGE
}
