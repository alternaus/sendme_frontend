import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { useApiClient } from '@/composables/useApiClient'

import type { IOrganization } from './interfaces/organization.interface'
export const useOrganizationService = () => {

  const privateApi = useApiClient(true)
  const toast = useToast()
  const { t } = useI18n()

  const showToast = (type: 'success' | 'error', messageKey: string) => {
    toast.add({
      severity: type,
      summary: t(type === 'success' ? 'general.success' : 'general.error'),
      detail: t(messageKey),
      life: 3000,
    })
  }

  const handleError = (error: unknown, messageKey: string) => {
    console.error(`❌ ${t(messageKey)}:`, error)
    showToast('error', messageKey)
  }

  const getOrganization = async (id: string) => {
    try {
      return await privateApi.get<IOrganization>(`/organizations/${id}`)
    } catch (error) {
      handleError(error, 'general.error_getting_organization')
      return null
    }
  }
  return {
    getOrganization,
  }
}