// src/services/auth/useAuthService.ts
import { useApiClient } from '@/composables/useApiClient'

import type { IUser } from '../user/interfaces/user.interface'
import type { IAuthResponse } from './interfaces/auth-response.interface'
import type { ILogin } from './interfaces/login.interface'

export const useAuthService = () => {
  const publicApi = useApiClient(false)
  const privateApi = useApiClient(true)

  const login = async (credentials: ILogin) => {
    return publicApi.post<IAuthResponse>('/auth/sign-in', credentials)
  }

  const refreshAuthToken = async (refreshToken: string) => {
    return publicApi.post<IAuthResponse>('/auth/refresh', { refreshToken })
  }

  const me = async () => {
    return privateApi.get<IUser>('/auth/me')
  }

  const logout = async () => {
    return privateApi.post<void>('/auth/logout')
  }

  // Métodos para autenticación con Google
  const getGoogleAuthUrl = async () => {
    return publicApi.get<{ url: string }>('/auth/google')
  }

  const handleGoogleCallback = async (code: string) => {
    return publicApi.get<IAuthResponse>(`/auth/google/callback?code=${code}`)
  }

  return {
    login,
    refreshAuthToken,
    me,
    logout,
    getGoogleAuthUrl,
    handleGoogleCallback
  }
}
