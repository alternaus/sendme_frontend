import { useApiClient } from '@/composables/useApiClient'

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

  const logout = async () => {
    return privateApi.post('/auth/logout')
  }

  return {
    login,
    refreshAuthToken,
    logout,
  }
}
