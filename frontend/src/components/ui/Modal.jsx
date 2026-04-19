import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

/**
 * Modal — overlay dialog with a gold-bordered card interior.
 *
 * Props:
 *   isOpen   (bool)     — controls visibility
 *   onClose  (fn)       — called when backdrop or × is clicked
 *   title    (string)   — shown in card header
 *   size     (string)   — 'sm' | 'md' (default) | 'lg'
 *   children (node)     — body content
 *
 * Usage:
 *   <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Transaction">
 *     <form>…</form>
 *   </Modal>
 */

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          'card shimmer-top relative z-10 w-full max-h-[90vh] flex flex-col',
          SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        ].join(' ')}
      >
        <div className="card-header shrink-0">
          <h2 className="card-title flex-1">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close" className="ml-auto">
            <X size={18} />
          </Button>
        </div>

        <div className="card-body overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
