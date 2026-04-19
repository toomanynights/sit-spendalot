/**
 * Shared formatting utilities used across dashboard and list components.
 */

/** Synced from settings (see DisplayFormatSync in layout). */
let globalShowDecimals = true

export function setGlobalShowDecimals(show) {
  globalShowDecimals = Boolean(show)
}

export function getGlobalShowDecimals() {
  return globalShowDecimals
}

function fractionDigits() {
  return globalShowDecimals ? 2 : 0
}

/**
 * Format a numeric amount with thousands separator and decimal places from settings.
 * Does NOT prepend a currency symbol — the UI adds context.
 *
 * @param {number | string | null | undefined} value
 * @returns {string}  e.g. "1,234.56"
 */
export function formatAmount(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return '—'
  const d = fractionDigits()
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(Math.abs(num))
}

/**
 * Format a signed amount, prepending "−" for negatives.
 * Useful for balance displays where sign matters visually.
 *
 * @param {number | string | null | undefined} value
 * @returns {string}  e.g. "−42.00" or "1,234.56"
 */
export function formatSigned(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return '—'
  const sign = num < 0 ? '−' : ''
  return sign + formatAmount(num)
}

/**
 * Format a date string or Date object as "14 Apr 2026".
 *
 * @param {string | Date | null | undefined} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Format a date as a short relative label: "Today", "Yesterday", or the date string.
 *
 * @param {string | Date | null | undefined} value
 * @returns {string}
 */
export function formatRelativeDate(value) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  if (isNaN(d.getTime())) return '—'

  const today = new Date()
  const diffDays = Math.round((d - today) / 86_400_000)

  if (diffDays === 0) return 'Today'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays === 1) return 'Tomorrow'
  return formatDate(d)
}
