import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../api/stats'

export const STATS_TODAY_KEY = ['stats', 'today']

/**
 * @param {number | null | undefined} accountId
 *   Pass the selected account id to scope stats to that account.
 *   Omit (or pass null/undefined) to use the server's primary-account default.
 */
export function useTodayStats(accountId) {
  return useQuery({
    queryKey: [...STATS_TODAY_KEY, accountId ?? null],
    queryFn: () => statsApi.today(accountId ? { account_id: accountId } : undefined),
    staleTime: 30_000,
    refetchInterval: 5 * 60_000,
  })
}

export function useSpendingByCategory(params) {
  return useQuery({
    queryKey: ['stats', 'spending-by-category', params],
    queryFn: () => statsApi.spendingByCategory(params),
    enabled: Boolean(params?.date_from && params?.date_to),
  })
}

export function useDailyTrend(days = 30) {
  return useQuery({
    queryKey: ['stats', 'daily-trend', days],
    queryFn: () => statsApi.dailyTrend(days),
    staleTime: 60_000,
  })
}

export function useMonthlyComparison() {
  return useQuery({
    queryKey: ['stats', 'monthly-comparison'],
    queryFn: statsApi.monthlyComparison,
    staleTime: 60_000,
  })
}
