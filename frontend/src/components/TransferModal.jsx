import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from './ui/Button'
import { Portal } from './ui/Portal'
import { transfersApi } from '../api/transfers'
import { ApiError } from '../api/client'

/**
 * Transfer modal — record a movement of funds between two accounts.
 * Shared between Treasury (per-row action) and Dashboard (TodayFortune action).
 *
 * Props:
 *   fromAccount { id, name, … }
 *   accounts    [account, …]   — full list, used to populate the destination dropdown
 *   onClose     ()             → close modal
 *   onSuccess   () → Promise   → optional extra refresh hook
 */
export default function TransferModal({ fromAccount, accounts, onClose, onSuccess }) {
  const qc = useQueryClient()
  const others = useMemo(
    () => (accounts || []).filter((a) => a.id !== fromAccount?.id),
    [accounts, fromAccount?.id]
  )
  const [toId, setToId] = useState(others[0]?.id ? String(others[0].id) : '')
  const [amount, setAmount] = useState('')
  const [transferDate, setTransferDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  )
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await transfersApi.create({
        from_account_id: fromAccount.id,
        to_account_id: Number(toId),
        amount: Number(amount),
        transfer_date: transferDate,
        description: description.trim() || undefined,
      })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['forecast'] })
      qc.invalidateQueries({ queryKey: ['lowest-points'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transfers'] })
      if (onSuccess) await onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Transfer failed.')
    } finally {
      setSaving(false)
    }
  }

  if (!others.length) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-lg border border-gold/30 shadow-card bg-brown-dark p-6">
            <p className="text-parchment font-crimson mb-4">
              Thou needest at least two accounts to transfer coin.
            </p>
            <Button variant="primary" onClick={onClose}>
              Understood
            </Button>
          </div>
        </div>
      </Portal>
    )
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4">
        <div className="w-full max-w-md rounded-lg border border-gold/30 shadow-card bg-brown-dark">
          <div className="card-header">
            <h3 className="card-title">Transfer from {fromAccount.name}</h3>
            <Button variant="ghost" className="ml-auto" onClick={onClose} aria-label="Close">
              <X size={18} />
            </Button>
          </div>
          <form className="card-body space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="input-label">To account</span>
              <select
                className="input"
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                required
              >
                {others.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="input-label">Amount</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="input-label">Transfer date</span>
              <input
                type="date"
                className="input"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="input-label">Description (optional)</span>
              <input
                className="input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={255}
              />
            </label>
            {error ? <p className="text-sm text-danger font-crimson">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" disabled={saving}>
                Record transfer
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
