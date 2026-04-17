import { useState } from 'react'
import Button from '@/components/ui/Button'
import styles from '@/pages/ProfilePage.module.css'

interface AccountActionsProps {
  isDeleting: boolean
  deleteError: string | null
  onDeleteAccount: () => Promise<void>
}

export function AccountActions({ isDeleting, deleteError, onDeleteAccount }: AccountActionsProps) {
  const [showModal, setShowModal] = useState(false)

  function openModal() {
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  async function handleConfirmDelete() {
    await onDeleteAccount()
  }

  return (
    <>
      <div className={styles.dangerZone}>
        <button type="button" className={styles.deleteAccountBtn} onClick={openModal}>
          Delete account
        </button>
      </div>

      {showModal && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={e => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className={styles.modalCard}>
            <h2 className={styles.modalTitle} id="delete-modal-title">
              Delete account
            </h2>
            <p className={styles.modalBody}>
              This will permanently delete your account and all your data. This action cannot be
              undone.
            </p>
            {deleteError && <p className={styles.modalError}>{deleteError}</p>}
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={closeModal} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="ghost"
                className={styles.deleteDangerBtn}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
