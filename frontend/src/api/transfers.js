import { api } from './client'

export const transfersApi = {
  list: () =>
    api.get('/transfers'),

  /**
   * @param {{ from_account_id: number, to_account_id: number, amount: number, transfer_date: string, description?: string }} data
   */
  create: (data) =>
    api.post('/transfers', data),
}
