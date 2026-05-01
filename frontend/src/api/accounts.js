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

  /**
   * List historical reconciliations (newest first) for this account.
   * @param {number} id
   */
  listCheckups: (id) =>
    api.get(`/accounts/${id}/checkups`),

  /**
   * Submit a per-payment-method checkup. Backend creates a correction tx
   * automatically when reported total differs from the ledger balance.
   * @param {number} id
   * @param {{ breakdowns: Array<{payment_method_id: number|null, amount: number|string}>, note?: string }} data
   */
  createCheckup: (id, data) =>
    api.post(`/accounts/${id}/checkups`, data),
}
