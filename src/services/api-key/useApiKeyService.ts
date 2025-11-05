// src/services/api-keys/useApiKeysService.ts
import { useApiClient } from '@/composables/useApiClient'

import type { IApiKey } from './interfaces/api-key.interface'
import type { ICreateApiKey } from './interfaces/create-api-key.interface'

export const useApiKeysService = () => {
  const api = useApiClient(true)

  const listApiKeys = async (): Promise<IApiKey[]> => {
    return api.get<IApiKey[]>('/api-keys')
  }

  const createApiKey = async (payload: ICreateApiKey): Promise<IApiKey> => {
    return api.post<IApiKey>('/api-keys', payload)
  }

  const deleteApiKey = async (id: string): Promise<void> => {
    await api.delete<void>(`/api-keys/${id}`)
  }

  return {
    listApiKeys,
    createApiKey,
    deleteApiKey
  }
}
