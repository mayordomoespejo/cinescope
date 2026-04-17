import { useState } from 'react'
import type { UseLoginFormReturn } from './useLoginForm'
import styles from '@/pages/LoginPage.module.css'

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

type LoginFormProps = Pick<
  UseLoginFormReturn,
  | 'email'
  | 'password'
  | 'showPassword'
  | 'emailError'
  | 'passwordError'
  | 'serverError'
  | 'submitting'
  | 'busy'
  | 'setEmail'
  | 'setPassword'
  | 'setShowPassword'
  | 'clearEmailError'
  | 'clearPasswordError'
  | 'handleSubmit'
>

export function LoginForm({
  email,
  password,
  showPassword,
  emailError,
  passwordError,
  serverError,
  submitting,
  busy,
  setEmail,
  setPassword,
  setShowPassword,
  clearEmailError,
  clearPasswordError,
  handleSubmit,
}: LoginFormProps) {
  // readOnly trick: suppress Chrome password manager popup until user focuses
  const [passwordReadOnly, setPasswordReadOnly] = useState(true)

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <div className={`${styles.field} ${emailError ? styles.fieldWithError : ''}`}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className={styles.input}
          placeholder="tu@email.com"
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            if (emailError) clearEmailError()
          }}
          disabled={busy}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
        />
        {emailError && (
          <span id="email-error" className={styles.fieldError} role="alert">
            {emailError}
          </span>
        )}
      </div>

      {/* Password */}
      <div className={`${styles.field} ${passwordError ? styles.fieldWithError : ''}`}>
        <label htmlFor="password" className={styles.label}>
          Contraseña
        </label>
        <div className={styles.inputWrap}>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`${styles.input} ${styles.inputWithToggle}`}
            placeholder="Mínimo 6 caracteres"
            value={password}
            readOnly={passwordReadOnly}
            onFocus={() => {
              setPasswordReadOnly(false)
            }}
            onChange={e => {
              setPassword(e.target.value)
              if (passwordError) clearPasswordError()
            }}
            disabled={busy}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? 'password-error' : undefined}
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            <EyeIcon visible={showPassword} />
          </button>
        </div>
        {passwordError && (
          <span id="password-error" className={styles.fieldError} role="alert">
            {passwordError}
          </span>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <p className={styles.serverError} role="alert">
          {serverError}
        </p>
      )}

      {/* Submit */}
      <button type="submit" className={styles.submitBtn} disabled={busy} aria-busy={submitting}>
        {submitting && <span className={styles.spinner} aria-hidden="true" />}
        <span className={`${styles.btnText} ${submitting ? styles.hidden : ''}`}>Continuar</span>
      </button>
    </form>
  )
}
