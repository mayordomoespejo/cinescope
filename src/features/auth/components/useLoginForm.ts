import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { mapFirebaseError } from '@/lib/firebaseErrors'
import { EMAIL_RE } from '@/lib/validation'
import { strings } from '@/lib/i18n'

export interface UseLoginFormReturn {
  // Field values
  email: string
  password: string
  showPassword: boolean

  // Errors
  emailError: string
  passwordError: string
  serverError: string

  // Loading states
  submitting: boolean
  googleLoading: boolean
  busy: boolean

  // Handlers
  setEmail: (value: string) => void
  setPassword: (value: string) => void
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  clearEmailError: () => void
  clearPasswordError: () => void
  handleSubmit: (e: FormEvent) => Promise<void>
  handleGoogle: () => Promise<void>
}

export function useLoginForm(): UseLoginFormReturn {
  const { smartAuth, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [serverError, setServerError] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Prevents setState calls after unmount (navigate() unmounts this component
  // before the finally block in handleSubmit / handleGoogle can run)
  const isMounted = useRef(true)
  useEffect(() => () => { isMounted.current = false }, [])

  const busy = submitting || googleLoading

  function validate(): boolean {
    let valid = true

    if (!EMAIL_RE.test(email)) {
      setEmailError(strings.auth.emailInvalid)
      valid = false
    } else {
      setEmailError('')
    }

    if (password.length < 6) {
      setPasswordError(strings.auth.passwordTooShort)
      valid = false
    } else {
      setPasswordError('')
    }

    return valid
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await smartAuth(email, password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (isMounted.current) setServerError(mapFirebaseError(code))
    } finally {
      if (isMounted.current) setSubmitting(false)
    }
  }

  async function handleGoogle(): Promise<void> {
    setServerError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (isMounted.current) setServerError(mapFirebaseError(code))
    } finally {
      if (isMounted.current) setGoogleLoading(false)
    }
  }

  return {
    email,
    password,
    showPassword,
    emailError,
    passwordError,
    serverError,
    submitting,
    googleLoading,
    busy,
    setEmail,
    setPassword,
    setShowPassword,
    clearEmailError: () => setEmailError(''),
    clearPasswordError: () => setPasswordError(''),
    handleSubmit,
    handleGoogle,
  }
}
