import * as Dialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import Button from '@/components/ui/Button'
import styles from './AccountActions.module.css'

interface AccountActionsProps {
  isClearing: boolean
  onClearData: () => void
}

/**
 * AccountActions — renders a "Clear all local data" button with a
 * confirmation dialog. Clears the cinescope-favorites, cinescope-watched,
 * and cinescope-lists localStorage keys.
 */
export function AccountActions({ isClearing, onClearData }: AccountActionsProps) {
  return (
    <Dialog.Root>
      <div className={styles.dangerZone}>
        <Dialog.Trigger asChild>
          <button type="button" className={styles.clearDataBtn}>
            Clear all local data
          </button>
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.modalCard} aria-describedby="clear-modal-body">
          <VisuallyHidden asChild>
            <Dialog.Title>Clear all local data</Dialog.Title>
          </VisuallyHidden>
          <h2 className={styles.modalTitle} id="clear-modal-title">
            Clear all local data
          </h2>
          <Dialog.Description asChild>
            <p className={styles.modalBody} id="clear-modal-body">
              This will permanently delete all your favorites, watchlist, watched history, and
              custom lists stored on this device. This action cannot be undone.
            </p>
          </Dialog.Description>
          <div className={styles.modalActions}>
            <Dialog.Close asChild>
              <Button variant="secondary" disabled={isClearing}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant="ghost"
              className={styles.clearDangerBtn}
              onClick={onClearData}
              disabled={isClearing}
            >
              {isClearing ? 'Clearing…' : 'Clear data'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
