import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountsApi } from '../api/accounts'
import { ACCOUNTS_KEY } from './useAccounts'

export const CHECKUPS_KEY = ['checkups']

export function useCheckups(accountId, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...CHECKUPS_KEY, accountId ?? null],
    queryFn: () => accountsApi.listCheckups(accountId),
    enabled: Boolean(accountId) && enabled,
    staleTime: 60_000,
  })
}

export function useCreateCheckup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ accountId, breakdowns, note }) =>
      accountsApi.createCheckup(accountId, { breakdowns, note }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ACCOUNTS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['forecast'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({
        queryKey: [...CHECKUPS_KEY, variables?.accountId ?? null],
      })
    },
  })
}
