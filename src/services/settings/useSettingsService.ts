import { useApiClient } from '@/composables/useApiClient'

import type { ISettingsPayload, ISettingsResponse } from './interface/settings.interface'



export const useSettingsService = () => {
  const api = useApiClient(true)

  const getSettings = async (orgId: string): Promise<ISettingsResponse> => {
    return api.get<ISettingsResponse>(`/settings/${orgId}`)
  }

  const createSettings = async (orgId: string, payload: ISettingsPayload) => {
    return api.post<ISettingsResponse>(`/settings/${orgId}`, payload)
  }

  const updateSettings = async (orgId: string, payload: ISettingsPayload) => {
    return api.patch<ISettingsResponse>(`/settings/${orgId}`, payload)
  }

  return {
    getSettings,
    createSettings,
    updateSettings
  }
}
