import { useApiClient } from '@/composables/useApiClient'

import type { IWhatsAppConnectionStatus } from './interfaces/whatsapp-connection-status.interface'
import type { IWhatsAppSignupRequest } from './interfaces/whatsapp-signup-request.interface'
import type { IWhatsAppSignupResponse } from './interfaces/whatsapp-signup-response.interface'

export const useWhatsAppService = () => {
  const privateApi = useApiClient(true)

  const connect = async (code: string) => {
    const request: IWhatsAppSignupRequest = { code }
    return privateApi.post<IWhatsAppSignupResponse, IWhatsAppSignupRequest>('/whatsapp-business/connect', request)
  }

  const getAccounts = async () => {
    return privateApi.get('/whatsapp-business/accounts')
  }

  const checkConnectionStatus = async () => {
    return privateApi.get<IWhatsAppConnectionStatus>('/whatsapp-business/status')
  }

  const disconnect = async () => {
    return privateApi.post<IWhatsAppSignupResponse>('/whatsapp-business/disconnect')
  }

  return {
    connect,
    getAccounts,
    checkConnectionStatus,
    disconnect
  }
}
