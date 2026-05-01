import { api } from './client'

export const settingsApi = {
  get: () =>
    api.get('/settings'),

  /**
   * @param {{
   * prediction_horizon_days?: number,
   * rolling_average_days?: number,
   * daily_high_threshold?: number,
   * daily_low_threshold?: number,
   * show_decimals?: boolean,
   * show_predictive_non_primary?: boolean,
   * require_payment_method?: boolean,
   * require_subcategory?: boolean,
 * prediction_notifications_enabled?: boolean,
 * prediction_notifications_time?: string,
 * checkup_notifications_enabled?: boolean,
 * checkup_notification_days?: number,
 * topbar_attention_dot_enabled?: boolean,
   * primary_account_id?: number | null
   * }} data
   */
  update: (data) =>
    api.patch('/settings', data),
}
