import { useApiClient } from '@/composables/useApiClient'

import type {
  MessageAudienceMode,
  MessageEnqueueResult,
  SmsAllMessagePayload,
  SmsContactsMessagePayload,
  SmsMessagePayload,
  SmsTagsMessagePayload,
} from './interfaces/message.interface'

const SMS_ENDPOINTS: Record<MessageAudienceMode, string> = {
  contacts: '/messages/sms/contacts',
  all: '/messages/sms/all',
  tags: '/messages/sms/tags',
}

export const useSmsService = () => {
  const privateApi = useApiClient(true)

  const postSms = async <TPayload extends SmsMessagePayload>(
    mode: MessageAudienceMode,
    payload: TPayload,
  ): Promise<MessageEnqueueResult> => {
    return privateApi.post<MessageEnqueueResult, TPayload>(
      SMS_ENDPOINTS[mode],
      payload,
    )
  }

  const sendSmsToContacts = (payload: SmsContactsMessagePayload) => postSms('contacts', payload)

  const sendSmsToAll = (payload: SmsAllMessagePayload) => postSms('all', payload)

  const sendSmsToTags = (payload: SmsTagsMessagePayload) => postSms('tags', payload)

  return {
    sendSmsToContacts,
    sendSmsToAll,
    sendSmsToTags,
  }
}
