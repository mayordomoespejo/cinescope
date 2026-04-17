/**
 * Centralized i18n strings for the application.
 *
 * All user-facing Spanish copy lives here so it is easy to audit, update,
 * or swap out for a full i18n library in the future.
 */
export const strings = {
  auth: {
    // Field labels
    passwordLabel: 'Contraseña',

    // Placeholders
    emailPlaceholder: 'tu@email.com',
    passwordPlaceholder: 'Mínimo 6 caracteres',

    // Aria labels
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',

    // Buttons
    submitButton: 'Continuar',
    googleButton: 'Continuar con Google',
    divider: 'o',

    // Validation errors
    emailInvalid: 'Introduce un email válido',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',

    // Firebase / server errors
    wrongPassword: 'Contraseña incorrecta',
    userNotFound: 'No existe una cuenta con este email',
    tooManyRequests: 'Demasiados intentos. Espera un momento',
    networkError: 'Error de red. Comprueba tu conexión',
    genericError: 'Ha ocurrido un error. Inténtalo de nuevo',

    // LoginPage copy
    loginPageAriaLabel: 'Inicio de sesión',
    logoAriaLabel: 'Volver a inicio',
    loginTitle: 'Bienvenido',
    loginSubtitle: 'Inicia sesión o crea una cuenta para continuar',
  },
} as const
