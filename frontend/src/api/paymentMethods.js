import { api } from './client'

export const paymentMethodsApi = {
  list: () =>
    api.get('/payment-methods'),

  create: (data) =>
    api.post('/payment-methods', data),

  update: (id, data) =>
    api.patch(`/payment-methods/${id}`, data),

  delete: (id) =>
    api.delete(`/payment-methods/${id}`),
}
