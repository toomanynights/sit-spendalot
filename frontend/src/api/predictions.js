import { api } from './client'

export const predictionsApi = {
  /* ── Templates ─────────────────────────────────────────── */

  listTemplates: (params) =>
    api.get('/predictions', params),

  getTemplate: (id) =>
    api.get(`/predictions/${id}`),

  createTemplate: (data) =>
    api.post('/predictions', data),

  updateTemplate: (id, data) =>
    api.patch(`/predictions/${id}`, data),

  deleteTemplate: (id) =>
    api.delete(`/predictions/${id}`),

  /** Pause: sets paused=true + deletes all future PENDING instances */
  pause: (id) =>
    api.post(`/predictions/${id}/pause`),

  /** Resume: sets paused=false + regenerates instances from today */
  resume: (id) =>
    api.post(`/predictions/${id}/resume`),

  /* ── Forecast ───────────────────────────────────────────── */

  /**
   * Full daily balance forecast array.
   * @param {{ days?: number, account_id?: number }} [params]
   */
  forecast: (params = {}) =>
    api.get('/predictions/forecast', params),

  /**
   * Lowest balance peril points in the forecast window.
   * @param {{ count?: number, account_id?: number }} [params]
   */
  lowest: (params = {}) =>
    api.get('/predictions/lowest', params),

  /* ── Instances ──────────────────────────────────────────── */

  /**
   * @param {{ status?: string, date_from?: string, date_to?: string, template_id?: number }} [params]
   */
  listInstances: (params) =>
    api.get('/predictions/instances', params),

  /**
   * @param {number} id
   * @param {{ confirmed_amount?: number, confirmed_date?: string, create_transaction?: boolean }} [data]
   */
  confirmInstance: (id, data) =>
    api.post(`/predictions/instances/${id}/confirm`, data),

  skipInstance: (id) =>
    api.post(`/predictions/instances/${id}/skip`),
}
