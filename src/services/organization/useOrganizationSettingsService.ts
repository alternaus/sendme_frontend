import { ref } from 'vue'

import { useApiClient } from '@/composables/useApiClient'

export interface IOrganizationSettings {
  id: number
  dateFormat: string
  timeFormat: string
  timezone: string
  organizationId: number
  createdAt: string
  updatedAt: string
}

export const useOrganizationSettingsService = () => {
  const privateApi = useApiClient(true)
  const settings = ref<IOrganizationSettings | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const getOrganizationSettings = async (organizationId: number): Promise<IOrganizationSettings | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await privateApi.get<IOrganizationSettings>(`/settings/${organizationId}`)
      settings.value = response
      return response
    } catch (e) {
      error.value = e as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    settings,
    isLoading,
    error,
    getOrganizationSettings
  }
}
