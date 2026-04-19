import { api } from './client'

export const excludedDaysApi = {
  list: () =>
    api.get('/excluded-days'),

  /**
   * @param {{ excluded_date: string, reason?: string }} data
   */
  create: (data) =>
    api.post('/excluded-days', data),

  /** @param {string} date  YYYY-MM-DD */
  delete: (date) =>
    api.delete(`/excluded-days/${date}`),
}
