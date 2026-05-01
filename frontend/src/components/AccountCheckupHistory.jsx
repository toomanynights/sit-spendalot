import { useCheckups } from '../hooks/useCheckups'
import { formatDate, formatSigned } from '../utils/format'

/**
 * Inline read-only history of checkups for one account.
 * Displays date, ledger, reported, diff, optional note. Newest first.
 */
export default function AccountCheckupHistory({ accountId, expanded }) {
  const { data, isLoading, error } = useCheckups(accountId, { enabled: expanded })

  if (!expanded) return null
  if (isLoading) {
    return (
      <p className="checkup-history-meta font-crimson italic">
        Summoning past reckonings…
      </p>
    )
  }
  if (error) {
    return (
      <p className="checkup-history-meta font-crimson italic text-danger">
        Hark! The chronicles of past reckonings could not be read.
      </p>
    )
  }
  const rows = data ?? []
  if (!rows.length) {
    return (
      <p className="checkup-history-meta font-crimson italic">
        No reckonings recorded yet.
      </p>
    )
  }

  return (
    <ul className="checkup-history-list">
      {rows.map((r) => {
        const diff = parseFloat(r.correction_amount)
        const diffClass = diff === 0 ? 'checkup-history-diff-balanced' : 'checkup-history-diff-off'
        return (
          <li key={r.id} className="checkup-history-row">
            <div className="checkup-history-row-main">
              <span className="checkup-history-date">{formatDate(r.checkup_date)}</span>
              <div className="checkup-history-numbers">
                <span>
                  Ledger <strong>{formatSigned(r.ledger_balance)}</strong>
                </span>
                <span>
                  Reported <strong>{formatSigned(r.reported_balance)}</strong>
                </span>
                <span className={diffClass}>
                  Diff <strong>{diff === 0 ? formatSigned(0) : formatSigned(diff)}</strong>
                </span>
              </div>
            </div>
            {r.note ? <p className="checkup-history-note">{r.note}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}
