import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transfersApi } from '../api/transfers'

export const TRANSFERS_KEY = ['transfers']

export function useTransfers() {
  return useQuery({
    queryKey: TRANSFERS_KEY,
    queryFn: transfersApi.list,
  })
}

export function useCreateTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: transfersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSFERS_KEY })
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
