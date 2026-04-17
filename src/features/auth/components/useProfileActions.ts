import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { deleteAccount } from '@/features/auth/authService'

export interface UseProfileActionsReturn {
  isDeleting: boolean
  deleteError: string | null
  handleDeleteAccount: () => Promise<void>
}

export function useProfileActions(): UseProfileActionsReturn {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDeleteAccount() {
    if (!user) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const token = await user.getIdToken()
      await deleteAccount(token)
      navigate('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setDeleteError(message)
      setIsDeleting(false)
    }
  }

  return { isDeleting, deleteError, handleDeleteAccount }
}
