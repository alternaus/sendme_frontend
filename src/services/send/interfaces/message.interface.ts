import { SmsMessageType } from '../constants/message.constants'

export interface MessageRecipientSummary {
  id: string
  recipient: string
}

export interface MessageEnqueueResult {
  queueId: string
  channel: 'email' | 'sms'
  messages: MessageRecipientSummary[]
}

export interface SmsMessageBasePayload {
  message: string
  type?: SmsMessageType
  country?: string
}

export interface SmsContactsMessagePayload extends SmsMessageBasePayload {
  contacts: string[]
}

export type SmsAllMessagePayload = SmsMessageBasePayload

export interface SmsTagsMessagePayload extends SmsMessageBasePayload {
  tagIds: string[]
}

export type SmsMessagePayload =
  | SmsContactsMessagePayload
  | SmsAllMessagePayload
  | SmsTagsMessagePayload

export interface EmailMessageBasePayload {
  subject: string
  message: string
}

export interface EmailContactsMessagePayload extends EmailMessageBasePayload {
  contacts: string[]
}

export type EmailAllMessagePayload = EmailMessageBasePayload

export interface EmailTagsMessagePayload extends EmailMessageBasePayload {
  tagIds: string[]
}

export type EmailMessagePayload =
  | EmailContactsMessagePayload
  | EmailAllMessagePayload
  | EmailTagsMessagePayload

export type MessageAudienceMode = 'contacts' | 'all' | 'tags'
