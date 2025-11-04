// src/services/api-keys/useApiKeysService.ts
import { useApiClient } from '@/composables/useApiClient'

import type { IApiKey } from './interfaces/api-key.interface'
import type { ICreateApiKey } from './interfaces/create-api-key.interface'

export const useApiKeysService = () => {
  const api = useApiClient(true)

  const list = async (): Promise<IApiKey[]> => {
    return await api.get<IApiKey[]>('/api-keys')
  }

  const create = async (payload: ICreateApiKey): Promise<IApiKey> => {
    return await api.post<IApiKey>('/api-keys', payload)
  }

  const remove = async (id:string | string): Promise<void> => {
    await api.delete<void>(`/api-keys/${id}`)
  }

  return { list, create, remove }
}
