/**
 * Badge — small inline label, wraps .badge / .badge-primary / .badge-muted.
 *
 * Variants:
 *   primary → gold background, dark text
 *   muted   → brown background, parchment text
 *   success → green tint
 *   danger  → red tint
 *
 * Usage:
 *   <Badge variant="primary">Primary</Badge>
 *   <Badge variant="danger">Overdue</Badge>
 */

const VARIANT_CLASSES = {
  primary: 'badge badge-primary',
  muted:   'badge badge-muted',
  success: 'badge bg-success/20 text-success',
  danger:  'badge bg-danger/20 text-danger',
}

export function Badge({ children, variant = 'muted', className = '' }) {
  const base = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.muted
  return (
    <span className={[base, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
