import { useState } from 'react'
import Button from '@/components/ui/Button'
import styles from '@/pages/ProfilePage.module.css'

interface AccountActionsProps {
  isClearing: boolean
  onClearData: () => void
}

/**
 * AccountActions — renders a "Clear all local data" button with a
 * confirmation modal. Clears the cinescope-favorites, cinescope-watched,
 * and cinescope-lists localStorage keys.
 */
export function AccountActions({ isClearing, onClearData }: AccountActionsProps) {
  const [showModal, setShowModal] = useState(false)

  function openModal() {
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  function handleConfirmClear() {
    onClearData()
    closeModal()
  }

  return (
    <>
      <div className={styles.dangerZone}>
        <button type="button" className={styles.clearDataBtn} onClick={openModal}>
          Clear all local data
        </button>
      </div>

      {showModal && (
        // Backdrop — click outside to dismiss
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className={styles.modalOverlay}
          onClick={e => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-modal-title"
            tabIndex={-1}
            className={styles.modalCard}
            onKeyDown={e => {
              if (e.key === 'Escape') closeModal()
            }}
          >
            <h2 className={styles.modalTitle} id="clear-modal-title">
              Clear all local data
            </h2>
            <p className={styles.modalBody}>
              This will permanently delete all your favorites, watchlist, watched history, and
              custom lists stored on this device. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={closeModal} disabled={isClearing}>
                Cancel
              </Button>
              <Button
                variant="ghost"
                className={styles.clearDangerBtn}
                onClick={handleConfirmClear}
                disabled={isClearing}
              >
                {isClearing ? 'Clearing…' : 'Clear data'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
