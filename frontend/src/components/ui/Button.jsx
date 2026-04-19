/**
 * Button — wraps the .btn / .btn-primary / .btn-ghost / .btn-active CSS classes.
 *
 * Variants:
 *   default  → .btn (brown border, muted parchment text)
 *   primary  → .btn .btn-primary (gold fill, dark text)
 *   active   → .btn .btn-active (pressed state for toggles)
 *   ghost    → .btn-ghost (transparent, no border, gold text)
 *   danger   → .btn with red accent (uses Tailwind overrides)
 *
 * Usage:
 *   <Button onClick={…}>Record Thy Deed</Button>
 *   <Button variant="primary" type="submit">Save</Button>
 *   <Button variant="ghost" onClick={close}><X size={16} /></Button>
 */

const VARIANT_CLASSES = {
  default: 'btn',
  primary: 'btn btn-primary',
  active:  'btn btn-active',
  ghost:   'btn-ghost',
  danger:  'btn border-danger/60 text-danger hover:bg-danger/20 hover:border-danger',
}

export function Button({
  children,
  variant = 'default',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const base = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''

  return (
    <button
      type={type}
      disabled={disabled}
      className={[base, disabledClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
