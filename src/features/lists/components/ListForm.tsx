import { useEffect, useRef, useState } from 'react'
import styles from '@/pages/ListsPage.module.css'

export interface ListFormProps {
  onSubmit: (name: string, description: string) => Promise<void>
  onCancel: () => void
}

/**
 * Inline form for creating a new list.
 * Auto-focuses the name input on mount.
 */
export default function ListForm({ onSubmit, onCancel }: ListFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(name, description)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className={styles.createForm} onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className={styles.input}
        placeholder="List name (required)"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={80}
        disabled={submitting}
      />
      <input
        className={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        maxLength={200}
        disabled={submitting}
      />
      <div className={styles.createFormActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={!name.trim() || submitting}>
          {submitting ? 'Creating…' : 'Create'}
        </button>
      </div>
    </form>
  )
}
