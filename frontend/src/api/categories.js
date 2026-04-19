import { api } from './client'

export const categoriesApi = {
  /** @returns {Promise<Record<string, string[]>>} parent category id → distinct subcategories */
  subcategoryUsage: () =>
    api.get('/categories/subcategory-usage'),

  list: () =>
    api.get('/categories'),

  get: (id) =>
    api.get(`/categories/${id}`),

  create: (data) =>
    api.post('/categories', data),

  update: (id, data) =>
    api.patch(`/categories/${id}`, data),

  delete: (id) =>
    api.delete(`/categories/${id}`),
}
