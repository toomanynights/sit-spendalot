import { createPortal } from 'react-dom'

/**
 * Renders children directly into document.body, escaping all ancestor
 * stacking contexts. Use for modals and overlays so z-index is global.
 */
export function Portal({ children }) {
  return createPortal(children, document.body)
}
