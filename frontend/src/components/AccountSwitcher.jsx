import { Crown, PiggyBank, Wallet } from 'lucide-react'
import { useSelectedAccount } from '../contexts/AccountContext'
import { Badge } from './ui/Badge'
import { Spinner } from './ui/Spinner'

/**
 * Renders a row of clickable account tabs.
 *
 * - Primary account always listed first, with a crown icon.
 * - Savings-type accounts get a "Savings" badge.
 * - The active account uses the .btn-active visual state.
 * - Selection is persisted in AccountContext (→ localStorage).
 */
export default function AccountSwitcher() {
  const { accounts, selectedId, setAccount } = useSelectedAccount()

  if (!accounts) {
    return <Spinner size="sm" className="mb-6" />
  }

  if (accounts.length === 0) return null

  // Primary first, then sorted by id for stable order.
  const sorted = [...accounts].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.id - b.id
  })

  return (
    <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Account switcher">
      {sorted.map((account) => {
        const isActive = account.id === selectedId
        const isSavings = account.account_type === 'savings'

        return (
          <button
            key={account.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => setAccount(account.id)}
            className={['btn flex items-center gap-2', isActive ? 'btn-active' : ''].filter(Boolean).join(' ')}
          >
            {account.is_primary
              ? <Crown size={14} className="text-gold shrink-0" aria-label="Primary account" />
              : isSavings
                ? <PiggyBank size={14} className="text-gold-muted shrink-0" />
                : <Wallet size={14} className="text-gold-muted shrink-0" />
            }
            <span>{account.name}</span>
            {isSavings && (
              <Badge variant="muted" className="ml-1 hidden sm:inline-block">Savings</Badge>
            )}
          </button>
        )
      })}
    </div>
  )
}
