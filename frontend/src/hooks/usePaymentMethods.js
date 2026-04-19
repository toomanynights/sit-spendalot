import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentMethodsApi } from '../api/paymentMethods'

export const PAYMENT_METHODS_KEY = ['payment-methods']

export function usePaymentMethods() {
  return useQuery({
    queryKey: PAYMENT_METHODS_KEY,
    queryFn: paymentMethodsApi.list,
    staleTime: 5 * 60_000,
  })
}

export function useCreatePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: paymentMethodsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENT_METHODS_KEY }),
  })
}

export function useUpdatePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => paymentMethodsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENT_METHODS_KEY }),
  })
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: paymentMethodsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENT_METHODS_KEY }),
  })
}
