import { api } from './client'

export const accountsApi = {
  list: () =>
    api.get('/accounts'),

  get: (id) =>
    api.get(`/accounts/${id}`),

  create: (data) =>
    api.post('/accounts', data),

  update: (id, data) =>
    api.patch(`/accounts/${id}`, data),

  delete: (id) =>
    api.delete(`/accounts/${id}`),

  /**
   * Create a balance-correction transaction for this account.
   * @param {number} id
   * @param {{ target_balance: number, correction_date: string, note?: string }} data
   */
  balanceCorrection: (id, data) =>
    api.post(`/accounts/${id}/balance-correction`, data),
}
