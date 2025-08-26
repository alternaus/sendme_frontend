import { useApiClient } from '@/composables/useApiClient'

import type { ISettingsPayload, ISettingsResponse } from './interface/settings.interface'



export const useSettingsService = () => {
  const api = useApiClient(true)

  const getSettings = async (orgId: number | string): Promise<ISettingsResponse | null> => {
    try {
      const res = await api.get<ISettingsResponse>(`/settings/${orgId}`)
      return res
    } catch (e) {
      throw e
    }
  }

  const createSettings = async (orgId: number | string, payload: ISettingsPayload) => {
    const res = await api.post<ISettingsResponse>(`/settings/${orgId}`, payload)
    return res
  }

  const updateSettings = async (orgId: number | string, payload: ISettingsPayload) => {
    const res = await api.patch<ISettingsResponse>(`/settings/${orgId}`, payload)
    return res
  }

  return { getSettings, createSettings, updateSettings }
}
