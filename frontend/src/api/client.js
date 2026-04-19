const BASE_URL = '/api'

function getAuthHeaders() {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function buildUrl(path, params) {
  if (!params) return `${BASE_URL}${path}`
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )
  const qs = new URLSearchParams(filtered).toString()
  return qs ? `${BASE_URL}${path}?${qs}` : `${BASE_URL}${path}`
}

async function request(path, { body, params, headers = {}, ...rest } = {}) {
  const url = buildUrl(path, params)

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })

  if (!response.ok) {
    let errorData = {}
    try { errorData = await response.json() } catch { /* empty */ }
    const message =
      errorData.error ||
      errorData.detail ||
      errorData.message ||
      `HTTP ${response.status}`
    throw new ApiError(response.status, message, errorData)
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  get:    (path, params)        => request(path, { method: 'GET', params }),
  post:   (path, body)          => request(path, { method: 'POST', body }),
  patch:  (path, body)          => request(path, { method: 'PATCH', body }),
  put:    (path, body)          => request(path, { method: 'PUT', body }),
  delete: (path)                => request(path, { method: 'DELETE' }),
}
