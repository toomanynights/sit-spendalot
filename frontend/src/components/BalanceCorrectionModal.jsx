import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from './ui/Button'
import { Portal } from './ui/Portal'
import { accountsApi } from '../api/accounts'
import { ApiError } from '../api/client'
import { formatSigned } from '../utils/format'

/**
 * Balance correction modal — adjusts an account to a target balance as of a date.
 * Shared between Treasury (per-row action) and Dashboard (TodayFortune action).
 *
 * Props:
 *   account   { id, name, current_balance, … }
 *   onClose   ()           → close modal
 *   onSuccess () → Promise → optional extra refresh (page-local state etc.)
 */
export default function BalanceCorrectionModal({ account, onClose, onSuccess }) {
  const qc = useQueryClient()
  const [currentBalance, setCurrentBalance] = useState(
    account?.current_balance != null ? String(account.current_balance) : ''
  )
  const [targetBalance, setTargetBalance] = useState('')
  const [correctionDate, setCorrectionDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  )
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const refreshBalance = useCallback(async () => {
    if (!account?.id) return
    try {
      const fresh = await accountsApi.get(account.id)
      setCurrentBalance(String(fresh.current_balance))
    } catch {
      // keep last value
    }
  }, [account?.id])

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await accountsApi.balanceCorrection(account.id, {
        target_balance: Number(targetBalance),
        correction_date: correctionDate,
        note: note.trim() || undefined,
      })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['forecast'] })
      qc.invalidateQueries({ queryKey: ['lowest-points'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['checkups'] })
      if (onSuccess) await onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Correction failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Portal>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-lg border border-gold/30 shadow-card bg-brown-dark">
        <div className="card-header">
          <h3 className="card-title">Balance correction - {account?.name}</h3>
          <Button variant="ghost" className="ml-auto" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div>
            <span className="input-label">Current balance</span>
            <p className="text-lg text-gold font-cinzel">{formatSigned(currentBalance)}</p>
            <Button
              type="button"
              variant="ghost"
              className="text-xs mt-1"
              onClick={() => refreshBalance()}
            >
              Refresh from ledger
            </Button>
          </div>
          <label className="block">
            <span className="input-label">Target balance</span>
            <input
              type="number"
              step="0.01"
              className="input"
              value={targetBalance}
              onChange={(e) => setTargetBalance(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="input-label">Correction date</span>
            <input
              type="date"
              className="input"
              value={correctionDate}
              onChange={(e) => setCorrectionDate(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="input-label">Note (optional)</span>
            <input
              className="input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={255}
            />
          </label>
          {error ? <p className="text-sm text-danger font-crimson">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              Apply correction
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  )
}
