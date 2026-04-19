import { api } from './client'

/**
 * @typedef {Object} TransactionFilters
 * @property {string}  [date_from]
 * @property {string}  [date_to]
 * @property {number}  [account_id]
 * @property {number}  [category_id]
 * @property {string}  [subcategory]
 * @property {string}  [transaction_type]   daily | unplanned | predicted | transfer
 * @property {number}  [payment_method_id]
 * @property {boolean} [include_deleted]
 * @property {number}  [offset]
 * @property {number}  [limit]
 */

export const transactionsApi = {
  /** @param {TransactionFilters} [params] */
  list: (params) => {
    if (!params) return api.get('/transactions')
    const normalized = { ...params }
    if (normalized.transaction_type && !normalized.type) {
      normalized.type = normalized.transaction_type
      delete normalized.transaction_type
    }
    return api.get('/transactions', normalized)
  },

  get: (id) =>
    api.get(`/transactions/${id}`),

  create: (data) =>
    api.post('/transactions', data),

  /** Submit multiple transactions in a single DB transaction */
  createBatch: (items) =>
    api.post('/transactions/batch', items),

  update: (id, data) =>
    api.patch(`/transactions/${id}`, data),

  /** Soft-delete: sets deleted_at, record is preserved */
  delete: (id) =>
    api.delete(`/transactions/${id}`),

  /** Restore a soft-deleted transaction (clears deleted_at). */
  restore: (id) =>
    api.post(`/transactions/${id}/restore`),

  /** Distinct non-null subcategory strings for datalist autocomplete */
  subcategories: () =>
    api.get('/transactions/subcategories'),
}
