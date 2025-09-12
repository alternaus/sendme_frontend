// WhatsApp Business embedded signup types
export interface WhatsAppSDKConfig {
  appId: string
  autoLogAppEvents: boolean
  xfbml: boolean
  version: string
}

export interface WhatsAppConfig {
  debug: boolean
}

export interface WhatsAppRequestCodeConfig {
  phoneNumber: string
  method: 'sms' | 'voice'
}

export interface WhatsAppEmbeddedSignupResponse {
  success: boolean
  phoneNumberId?: string
  accessToken?: string
  error?: string
}