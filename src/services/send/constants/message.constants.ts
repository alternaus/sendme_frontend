export enum MessageChannel {
  SMS = 'sms',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
}

export enum SmsMessageType {
  SMS = 'sms',
  OTP = 'otp',
  FLASH = 'flash',
}

export const MESSAGE_LIMITS = {
  SMS: 459,
  EMAIL: Infinity,
  WHATSAPP: 4096,
} as const

export type MessageChannelType = keyof typeof MessageChannel
export type SmsMessageTypeType = keyof typeof SmsMessageType
