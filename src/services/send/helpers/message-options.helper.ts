import { SmsMessageType } from '../constants/message.constants'

export interface MessageTypeOption {
  name: string
  value: SmsMessageType
}

export const createSmsMessageTypeOptions = (t: (key: string) => string): MessageTypeOption[] => [
  { name: t('general.sms_standard'), value: SmsMessageType.SMS },
  { name: t('general.sms_otp'), value: SmsMessageType.OTP },
  { name: t('general.sms_flash'), value: SmsMessageType.FLASH },
]
