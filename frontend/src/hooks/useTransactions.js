import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactions'

export const TRANSACTIONS_KEY = ['transactions']
export const SUBCATEGORIES_KEY = ['subcategories']

/** @param {import('../api/transactions').TransactionFilters} [filters] */
export function useTransactions(filters) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, filters],
    queryFn: () => transactionsApi.list(filters),
  })
}

/** Distinct subcategory strings for datalist autocomplete */
export function useSubcategories() {
  return useQuery({
    queryKey: SUBCATEGORIES_KEY,
    queryFn: transactionsApi.subcategories,
    staleTime: 2 * 60_000,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: SUBCATEGORIES_KEY })
    },
  })
}

export function useCreateBatchTransactions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionsApi.createBatch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: SUBCATEGORIES_KEY })
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => transactionsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useRestoreTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transactionsApi.restore,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
