import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { useApiClient } from '@/composables/useApiClient'
import { useAuthStore } from '@/stores/useAuthStore'

import type { IMessage } from './interfaces/message.interface'

export const useSendService = () => {
  const privateApi = useApiClient(true)
  const authStore = useAuthStore()
  const toast = useToast()
  const { t } = useI18n()

  // Servicio para obtener la API Key de la organización
  const getApiKey = async (): Promise<string | null> => {
    const organizationId = authStore.user?.organizationId

    if (!organizationId) {
      console.error('❌ No se encontró el ID de la organización en el usuario autenticado')
      return null
    }

    try {
      const { apiKey } = await privateApi.get<{ apiKey: string }>(`/organizations/${organizationId}`)
      return apiKey || null
    } catch (error) {
      console.error('❌ Error obteniendo el apiKey:', error)
      return null
    }
  }

  // Servicio para enviar un mensaje SMS
  const sendMessageSms = async (message: IMessage) => {
    try {
      const apiKey = await getApiKey()
      if (!apiKey) throw new Error('No se pudo obtener el apiKey')

      const response = await privateApi.post<IMessage, IMessage>(`/messages/send/sms/${apiKey}`, message)

      toast.add({
        severity: 'success',
        summary: t('general.success'),
        detail: t('general.message_send_success'),
        life: 3000,
      })
      return response
    } catch (error) {
      console.error('❌ Error enviando el mensaje SMS:', error)
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
      const apiKey = await getApiKey()
      if (!apiKey) throw new Error('No se pudo obtener el apiKey')

      const response = await privateApi.post<IMessage, IMessage>(`/messages/send/sms/all/${apiKey}`, message)
      toast.add({
        severity: 'success',
        summary: t('general.success'),
        detail: t('general.message_send_success'),
        life: 3000,
      })
      return response
    } catch (error) {
      console.error('❌ Error enviando el mensaje SMS a todos los contactos:', error)
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: t('general.error_sending_message'),
        life: 3000,
      })

      return null
    }
  }

  return { sendMessageSms, sendSmsToAllContacts }
}