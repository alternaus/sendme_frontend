export interface IGoogleAuthUrl {
  url: string
}

export interface IGoogleCallback {
  code: string
}

export interface IGoogleAuthStatus {
  hasValidTokens: boolean
  reauthUrl: string
  message: string
}
