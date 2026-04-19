import { ApiError } from './client'

export const authApi = {
  /**
   * Exchange username + password for a JWT access token.
   * FastAPI's OAuth2PasswordRequestForm requires form-encoded body,
   * NOT JSON — so this bypasses the JSON client intentionally.
   */
  async login(username, password) {
    const body = new URLSearchParams({ username, password })
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!response.ok) {
      let data = {}
      try { data = await response.json() } catch { /* empty */ }
      const message = data.detail || data.error || `HTTP ${response.status}`
      throw new ApiError(response.status, message, data)
    }

    return response.json()
  },
}

export function saveToken(token) {
  localStorage.setItem('access_token', token)
}

export function clearToken() {
  localStorage.removeItem('access_token')
}

export function getToken() {
  return localStorage.getItem('access_token')
}

export function isAuthenticated() {
  return Boolean(getToken())
}
