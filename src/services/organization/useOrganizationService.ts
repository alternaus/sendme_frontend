import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { useApiClient } from '@/composables/useApiClient'

import type { IPaginationResponse } from '../interfaces/pagination-response.interface'
import type { IFilterRecharge } from './interfaces/filter-recharge.interface'
import type { IOrganization } from './interfaces/organization.interface'
import type { IRecharge } from './interfaces/recharge.interface'
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
    showToast('error', messageKey)
  }

  const getOrganization = async (id: number) => {
    try {
      return await privateApi.get<IOrganization>(`/organizations/${id}`)
    } catch (error) {
      handleError(error, 'general.error_getting_organization')
      return null
    }
  }

  const getRecharges = async (query?: IFilterRecharge) => {
    try {
      return await privateApi.get<IPaginationResponse<IRecharge>>('/recharges', { params: { ...query } })
    } catch (error) {
      handleError(error, 'general.error_getting_recharges')
      return null
    }
  }

  return {
    getOrganization,
    getRecharges,
  }
}
