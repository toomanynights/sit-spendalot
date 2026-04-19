import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { predictionsApi } from '../api/predictions'

export const TEMPLATES_KEY    = ['prediction-templates']
export const INSTANCES_KEY    = ['prediction-instances']
export const FORECAST_KEY     = ['forecast']
export const LOWEST_KEY       = ['lowest-points']

/* ── Templates ─────────────────────────────────────────────────── */

export function usePredictionTemplates(accountId) {
  return useQuery({
    queryKey: [...TEMPLATES_KEY, accountId ?? null],
    queryFn: () => predictionsApi.listTemplates(
      accountId ? { account_id: accountId } : undefined
    ),
  })
}

export function useCreatePredictionTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: predictionsApi.createTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY })
      qc.invalidateQueries({ queryKey: INSTANCES_KEY })
      qc.invalidateQueries({ queryKey: FORECAST_KEY })
      qc.invalidateQueries({ queryKey: LOWEST_KEY })
    },
  })
}

export function useUpdatePredictionTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => predictionsApi.updateTemplate(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY })
      qc.invalidateQueries({ queryKey: INSTANCES_KEY })
      qc.invalidateQueries({ queryKey: FORECAST_KEY })
      qc.invalidateQueries({ queryKey: LOWEST_KEY })
    },
  })
}

export function useDeletePredictionTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: predictionsApi.deleteTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY })
      qc.invalidateQueries({ queryKey: INSTANCES_KEY })
      qc.invalidateQueries({ queryKey: FORECAST_KEY })
      qc.invalidateQueries({ queryKey: LOWEST_KEY })
    },
  })
}

export function usePausePredictionTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: predictionsApi.pause,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY })
      qc.invalidateQueries({ queryKey: INSTANCES_KEY })
      qc.invalidateQueries({ queryKey: FORECAST_KEY })
      qc.invalidateQueries({ queryKey: LOWEST_KEY })
    },
  })
}

export function useResumePredictionTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: predictionsApi.resume,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATES_KEY })
      qc.invalidateQueries({ queryKey: INSTANCES_KEY })
      qc.invalidateQueries({ queryKey: FORECAST_KEY })
      qc.invalidateQueries({ queryKey: LOWEST_KEY })
    },
  })
}

/* ── Forecast ───────────────────────────────────────────────────── */

/**
 * @param {number} [days=90]
 * @param {number | null} [accountId]
 */
export function useForecast(days = 90, accountId) {
  return useQuery({
    queryKey: [...FORECAST_KEY, days, accountId ?? null],
    queryFn: () => predictionsApi.forecast({
      days,
      ...(accountId ? { account_id: accountId } : {}),
    }),
    staleTime: 60_000,
  })
}

/**
 * @param {number} [count=2]
 * @param {number | null} [accountId]
 */
export function useLowestPoints(count = 2, accountId) {
  return useQuery({
    queryKey: [...LOWEST_KEY, count, accountId ?? null],
    queryFn: () => predictionsApi.lowest({
      count,
      ...(accountId ? { account_id: accountId } : {}),
    }),
    staleTime: 60_000,
  })
}

/* ── Instances ──────────────────────────────────────────────────── */

export function usePredictionInstances(params) {
  return useQuery({
    queryKey: [...INSTANCES_KEY, params],
    queryFn: () => predictionsApi.listInstances(params),
  })
}

export function useConfirmInstance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => predictionsApi.confirmInstance(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INSTANCES_KEY })
      qc.invalidateQueries({ queryKey: FORECAST_KEY })
      qc.invalidateQueries({ queryKey: LOWEST_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useSkipInstance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: predictionsApi.skipInstance,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INSTANCES_KEY })
      qc.invalidateQueries({ queryKey: FORECAST_KEY })
      qc.invalidateQueries({ queryKey: LOWEST_KEY })
    },
  })
}
