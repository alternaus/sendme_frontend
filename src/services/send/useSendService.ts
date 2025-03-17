import { useApiClient } from '@/composables/useApiClient'
import { useAuthStore } from '@/stores/useAuthStore'

import type { IMessage } from './interfaces/message.interface'

export const useSendService = () => {
  const privateApi = useApiClient(true)
  const authStore = useAuthStore()

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

      return await privateApi.post<IMessage, IMessage>(`/messages/send/sms/${apiKey}`, message)
    } catch (error) {
      console.error('❌ Error enviando el mensaje SMS:', error)
      return null
    }
  }

  return { sendMessageSms }
}