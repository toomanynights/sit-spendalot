import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authApi, saveToken, clearToken, isAuthenticated } from '../api/auth'

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated)

  const loginMutation = useMutation({
    mutationFn: ({ username, password }) => authApi.login(username, password),
    onSuccess: (data) => {
      saveToken(data.access_token)
      setAuthenticated(true)
    },
  })

  const logout = useCallback(() => {
    clearToken()
    setAuthenticated(false)
  }, [])

  return {
    authenticated,
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  }
}
