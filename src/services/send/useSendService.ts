import { useApiClient } from '@/composables/useApiClient'

import { MessageChannel, SmsMessageType } from './constants/message.constants'
import type {
  MessageEnqueueResult,
  SmsMessageBasePayload,
} from './interfaces/message.interface'
import { useEmailService } from './useEmailService'
import { useSmsService } from './useSmsService'

interface SendBatchMessageInput {
  channel: MessageChannel
  message: string
  subject?: string
  contacts?: string[]
  tagIds?: string[]
  sendToAll?: boolean
  country?: string
  messageType?: SmsMessageType
}

export const useSendService = () => {
  const privateApi = useApiClient(true)

  const { sendEmailToContacts, sendEmailToAll, sendEmailToTags } = useEmailService()
  const { sendSmsToContacts, sendSmsToAll, sendSmsToTags } = useSmsService()

  const sendBatchMessage = async (payload: SendBatchMessageInput): Promise<MessageEnqueueResult> => {
    if (payload.channel === MessageChannel.EMAIL) {
      const base = {
        subject: payload.subject ?? '',
        message: payload.message,
      }

      if (payload.sendToAll) {
        return sendEmailToAll(base)
      }

      if (payload.tagIds && payload.tagIds.length > 0) {
        return sendEmailToTags({ ...base, tagIds: payload.tagIds })
      }

      return sendEmailToContacts({ ...base, contacts: payload.contacts ?? [] })
    }

    if (payload.channel === MessageChannel.SMS) {
      const base: SmsMessageBasePayload = {
        message: payload.message,
        ...(payload.country ? { country: payload.country } : {}),
        ...(payload.messageType ? { type: payload.messageType } : {}),
      }

      if (payload.sendToAll) {
        return sendSmsToAll(base)
      }

      if (payload.tagIds && payload.tagIds.length > 0) {
        return sendSmsToTags({ ...base, tagIds: payload.tagIds })
      }

      return sendSmsToContacts({ ...base, contacts: payload.contacts ?? [] })
    }

    return privateApi.post<MessageEnqueueResult, SendBatchMessageInput>(
      '/messages/send',
      payload,
    )
  }

  return { sendBatchMessage }
}
