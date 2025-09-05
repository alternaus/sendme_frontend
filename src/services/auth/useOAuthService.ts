import { useApiClient } from '@/composables/useApiClient'

import type {
  IOAuthAuthResponse,
  IOAuthAuthUrl,
  IOAuthBackendStatus,
  IOAuthStatus,
  OAuthProviderType
} from './interfaces/oauth.interface'

export const useOAuthService = () => {
  const publicApi = useApiClient(false)
  const privateApi = useApiClient(true)

  const getAuthUrl = async (provider: OAuthProviderType, userId?: number) => {
    const params = userId ? `?userId=${userId}` : ''
    return publicApi.get<IOAuthAuthUrl>(`/auth/oauth/${provider}${params}`)
  }

  const handleCallback = async (provider: OAuthProviderType, code: string, state?: string) => {
    const params = new URLSearchParams({ code })
    if (state) params.append('state', state)
    return publicApi.get<IOAuthAuthResponse>(`/auth/oauth/${provider}/callback?${params}`)
  }

  const checkStatus = async (provider: OAuthProviderType) => {
    const response = await privateApi.get<IOAuthBackendStatus>(`/auth/oauth/${provider}/status`)
    
    // Mapear la respuesta del backend al formato esperado por el frontend
    return {
      hasValidTokens: response.hasOAuthTokens || false,
      provider,
      message: response.connected ? undefined : 'OAuth tokens not available'
    } as IOAuthStatus
  }

  const revokeTokens = async (provider: OAuthProviderType) => {
    return privateApi.delete(`/auth/oauth/${provider}/tokens`)
  }

  const handleGoogleOneTap = async (token: string) => {
    return publicApi.post<IOAuthAuthResponse>('/auth/google/one-tap', { token })
  }

  return {
    getAuthUrl,
    handleCallback,
    checkStatus,
    revokeTokens,
    handleGoogleOneTap
  }
}
