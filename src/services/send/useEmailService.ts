import { useApiClient } from '@/composables/useApiClient'

import type {
  EmailAllMessagePayload,
  EmailContactsMessagePayload,
  EmailMessagePayload,
  EmailTagsMessagePayload,
  MessageAudienceMode,
  MessageEnqueueResult,
} from './interfaces/message.interface'

const EMAIL_ENDPOINTS: Record<MessageAudienceMode, string> = {
  contacts: '/messages/email/contacts',
  all: '/messages/email/all',
  tags: '/messages/email/tags',
}

export const useEmailService = () => {
  const privateApi = useApiClient(true)

  const postEmail = async <TPayload extends EmailMessagePayload>(
    mode: MessageAudienceMode,
    payload: TPayload,
  ): Promise<MessageEnqueueResult> => {
    return privateApi.post<MessageEnqueueResult, TPayload>(
      EMAIL_ENDPOINTS[mode],
      payload,
    )
  }

  const sendEmailToContacts = (payload: EmailContactsMessagePayload) => postEmail('contacts', payload)

  const sendEmailToAll = (payload: EmailAllMessagePayload) => postEmail('all', payload)

  const sendEmailToTags = (payload: EmailTagsMessagePayload) => postEmail('tags', payload)

  return {
    sendEmailToContacts,
    sendEmailToAll,
    sendEmailToTags,
  }
}
