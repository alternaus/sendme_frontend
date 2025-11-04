import type { IUser } from "@/services/user/interfaces/user.interface"

export type OAuthProviderType = 'google' | 'facebook' | 'microsoft'

export interface IOAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  scope?: string[]
}

export interface IOAuthUserInfo {
  providerId: string
  email: string
  name: string
  picture?: string
}


export interface IOAuthAuthResponse {
  accessToken: string
  refreshToken?: string
  provider?: OAuthProviderType
  userInfo?: IOAuthUserInfo
  user?: IUser
}

export interface IOAuthAuthUrl {
  url: string
  state?: string
}

export interface IOAuthStatus {
  hasValidTokens: boolean
  reauthUrl?: string
  message?: string
  provider: OAuthProviderType
}

export interface IOAuthBackendStatus {
  connected: boolean
  hasOAuthTokens: boolean
  capabilities?: {
    contacts: boolean
    sheets: boolean
  }
  authMethod?: string
}
