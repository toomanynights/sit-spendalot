import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'

const AccountContext = createContext(null)

/**
 * Provides the currently selected account to the whole protected app shell.
 *
 * Initialization order:
 *   1. Read the last selection from localStorage.
 *   2. When accounts load, validate the saved id still exists.
 *   3. If it doesn't (account deleted, first load, etc.) fall back to the
 *      primary account, then the first account in the list.
 */
export function AccountProvider({ children }) {
  const { data: accounts = [] } = useAccounts()

  const [savedId, setSavedId] = useState(() => {
    const raw = localStorage.getItem('selectedAccountId')
    return raw ? parseInt(raw, 10) : null
  })

  // Resolve the effective selected id, guarding against stale/deleted ids.
  const selectedId = useMemo(() => {
    if (!accounts.length) return savedId
    if (savedId && accounts.some((a) => a.id === savedId)) return savedId
    return accounts.find((a) => a.is_primary)?.id ?? accounts[0]?.id ?? null
  }, [accounts, savedId])

  const setAccount = useCallback((id) => {
    localStorage.setItem('selectedAccountId', String(id))
    setSavedId(id)
  }, [])

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedId) ?? null,
    [accounts, selectedId],
  )

  const primaryAccount = useMemo(
    () => accounts.find((a) => a.is_primary) ?? accounts[0] ?? null,
    [accounts],
  )

  const value = useMemo(
    () => ({ accounts, selectedId, selectedAccount, primaryAccount, setAccount }),
    [accounts, selectedId, selectedAccount, primaryAccount, setAccount],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

/**
 * Hook to access the account context.
 * Must be used inside <AccountProvider>.
 */
export function useSelectedAccount() {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useSelectedAccount must be used within <AccountProvider>')
  return ctx
}
