//src/services/auth/useAuthService.ts
import { useApiClient } from '@/composables/useApiClient'

import type { IUser } from '../user/interfaces/user.interface'
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  IAuthResponse,
  IGoogleAuthUrl,
  ILogin,
  ISignUp,
  ResetPasswordDto} from './interfaces'

export const useAuthService = () => {
  const publicApi = useApiClient(false)
  const privateApi = useApiClient(true)

  const login = async (credentials: ILogin) => {
    return publicApi.post<IAuthResponse>('/auth/sign-in', credentials)
  }

  const signUp = async (userData: ISignUp) => {
    return publicApi.post<IAuthResponse>('/auth/sign-up', userData)
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

  const getGoogleAuthUrl = async () => {
    return publicApi.get<IGoogleAuthUrl>('/auth/google')
  }

  const handleGoogleCallback = async (code: string) => {
    return publicApi.get<IAuthResponse>(`/auth/google/callback?code=${code}`)
  }

  const forgotPassword = async (data: ForgotPasswordDto) => {
    return publicApi.post<{ message: string }>('/auth/forgot-password', data)
  }

  const resetPassword = async (data: ResetPasswordDto) => {
    return publicApi.post<{ message: string }>('/auth/reset-password', data)
  }

  const changePassword = async (data: ChangePasswordDto) => {
    return privateApi.post<{ message: string }>('/auth/change-password', data)
  }

  return {
    login,
    signUp,
    refreshAuthToken,
    me,
    logout,
    getGoogleAuthUrl,
    handleGoogleCallback,
    forgotPassword,
    resetPassword,
    changePassword
  }
}
