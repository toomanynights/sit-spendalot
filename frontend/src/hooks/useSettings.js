import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../api/settings'
import { excludedDaysApi } from '../api/excludedDays'
import { INSTANCES_KEY, LOWEST_KEY } from './usePredictions'

export const SETTINGS_KEY      = ['settings']
export const EXCLUDED_DAYS_KEY = ['excluded-days']

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: settingsApi.get,
    staleTime: 5 * 60_000,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEY })
      qc.invalidateQueries({ queryKey: ['forecast'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: INSTANCES_KEY })
      qc.invalidateQueries({ queryKey: LOWEST_KEY })
    },
  })
}

export function useExcludedDays() {
  return useQuery({
    queryKey: EXCLUDED_DAYS_KEY,
    queryFn: excludedDaysApi.list,
  })
}

export function useCreateExcludedDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: excludedDaysApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXCLUDED_DAYS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['forecast'] })
    },
  })
}

export function useDeleteExcludedDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: excludedDaysApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXCLUDED_DAYS_KEY })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['forecast'] })
    },
  })
}
