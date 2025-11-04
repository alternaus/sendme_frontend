import { SmsMessageType } from '../constants/message.constants'

export interface MessageTypeOption {
  name: string
  value: SmsMessageType
}

export const createSmsMessageTypeOptions = (t: (key: string) => string): MessageTypeOption[] => [
  { name: t('send.message_types.SMS'), value: SmsMessageType.SMS },
  { name: t('send.message_types.OTP'), value: SmsMessageType.OTP },
  { name: t('send.message_types.FLASH'), value: SmsMessageType.FLASH },
]
