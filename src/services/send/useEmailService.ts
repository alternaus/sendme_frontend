import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

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
  const toast = useToast()
  const { t } = useI18n()

  const notifySuccess = () => {
    toast.add({
      severity: 'success',
      summary: t('common.general.success'),
      detail: t('send.message_send_success'),
      life: 3000,
    })
  }

  const notifyError = () => {
    toast.add({
      severity: 'error',
      summary: t('common.general.error'),
      detail: t('send.error_sending_message'),
      life: 3000,
    })
  }

  const postEmail = async <TPayload extends EmailMessagePayload>(
    mode: MessageAudienceMode,
    payload: TPayload,
  ): Promise<MessageEnqueueResult | null> => {
    try {
      const response = await privateApi.post<MessageEnqueueResult, TPayload>(
        EMAIL_ENDPOINTS[mode],
        payload,
      )
      notifySuccess()
      return response
    } catch {
      notifyError()
      return null
    }
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
