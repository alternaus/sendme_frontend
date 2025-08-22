import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { useApiClient } from '@/composables/useApiClient'

import type { IBatchMessage, IMessage } from './interfaces/message.interface'

export const useSendService = () => {
  const privateApi = useApiClient(true)
  const toast = useToast()
  const { t } = useI18n()

  const sendBatchMessage = async (message: IBatchMessage) => {
    try {
      const response = await privateApi.post<IBatchMessage, IBatchMessage>(`/messages/send`, message)
      toast.add({
        severity: 'success',
        summary: t('general.success'),
        detail: t('general.message_send_success'),
        life: 3000,
      })
      return response
    } catch {
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: t('general.error_sending_message'),
        life: 3000,
      })

      return null
    }
  }

  const sendMessageSms = async (message: IMessage) => {
    try {

      const response = await privateApi.post<IMessage, IMessage>(`/messages/send`, message)

      toast.add({
        severity: 'success',
        summary: t('general.success'),
        detail: t('general.message_send_success'),
        life: 3000,
      })
      return response
    } catch {
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: t('general.error_sending_message'),
        life: 3000,
      })

      return null
    }
  }

  // Servicio para enviar un sms a todos los contactos
  const sendSmsToAllContacts = async (message: IMessage) => {
    try {

      const response = await privateApi.post<IMessage, IMessage>(`/messages/send`, message)
      toast.add({
        severity: 'success',
        summary: t('general.success'),
        detail: t('general.message_send_success'),
        life: 3000,
      })
      return response
    } catch {
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: t('general.error_sending_message'),
        life: 3000,
      })

      return null
    }
  }

  return { sendBatchMessage, sendMessageSms, sendSmsToAllContacts }
}
