import { useApiClient } from '@/composables/useApiClient'

import type { IUser } from '../user/interfaces/user.interface'
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  IAuthResponse,
  ILogin,
  ISignUp,
  OAuthProviderType,
  ResetPasswordDto
} from './interfaces'
import { useOAuthService } from './useOAuthService'

export const useAuthService = () => {
  const publicApi = useApiClient(false)
  const privateApi = useApiClient(true)
  const oauthService = useOAuthService()

  // Basic authentication methods
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

  // OAuth generic methods
  const getOAuthUrl = async (provider: OAuthProviderType, userId?: number) => {
    return oauthService.getAuthUrl(provider, userId)
  }

  const handleOAuthCallback = async (provider: OAuthProviderType, code: string, state?: string) => {
    return oauthService.handleCallback(provider, code, state)
  }

  const checkOAuthStatus = async (provider: OAuthProviderType) => {
    return oauthService.checkStatus(provider)
  }

  const revokeOAuthTokens = async (provider: OAuthProviderType) => {
    return oauthService.revokeTokens(provider)
  }

  // Google One Tap (specific method)
  const handleGoogleOneTap = async (token: string) => {
    return oauthService.handleGoogleOneTap(token)
  }

  // Password management methods
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
    // Basic authentication
    login,
    signUp,
    refreshAuthToken,
    me,
    logout,

    // OAuth generic
    getOAuthUrl,
    handleOAuthCallback,
    checkOAuthStatus,
    revokeOAuthTokens,

    // Google specific
    handleGoogleOneTap,

    // Password management
    forgotPassword,
    resetPassword,
    changePassword
  }
}
