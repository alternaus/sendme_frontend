import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

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

  const postSms = async <TPayload extends SmsMessagePayload>(
    mode: MessageAudienceMode,
    payload: TPayload,
  ): Promise<MessageEnqueueResult | null> => {
    try {
      const response = await privateApi.post<MessageEnqueueResult, TPayload>(
        SMS_ENDPOINTS[mode],
        payload,
      )
      notifySuccess()
      return response
    } catch {
      notifyError()
      return null
    }
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
