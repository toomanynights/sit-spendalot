import { api } from './client'

export const statsApi = {
  /**
   * Today's actual balance, predicted balance, and spending breakdown.
   * @param {{ account_id?: number }} [params]
   */
  today: (params) =>
    api.get('/stats/today', params),

  /** @param {{ date_from: string, date_to: string }} params */
  spendingByCategory: (params) =>
    api.get('/stats/spending-by-category', params),

  /** @param {number} [days=30] */
  dailyTrend: (days = 30) =>
    api.get('/stats/daily-trend', { days }),

  monthlyComparison: () =>
    api.get('/stats/monthly-comparison'),
}
