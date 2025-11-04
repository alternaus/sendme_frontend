import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { useApiClient } from '@/composables/useApiClient'

import type { IPaginationResponse } from '../interfaces/pagination-response.interface'
import type { ICreateManualRecharge } from './interfaces/create-manual-recharge.interface'
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

  const getOrganization = async (id:string) => {
    try {
      return await privateApi.get<IOrganization>(`/organizations/${id}`)
    } catch (error) {
      handleError(error, 'general.error_getting_organization')
      return null
    }
  }

  const getOrganizations = async () => {
    try {
      return await privateApi.get<IOrganization[]>('/organizations')
    } catch (error) {
      handleError(error, 'common.general.error')
      return null
    }
  }

  const getRecharges = async (query?: IFilterRecharge) => {
    try {
      return await privateApi.get<IPaginationResponse<IRecharge>>('/recharges', { params: { ...query } })
    } catch (error) {
      handleError(error, 'common.general.error')
      return null
    }
  }

  const createManualRecharge = async (data: ICreateManualRecharge) => {
    try {
      const response = await privateApi.post<IRecharge>('/recharges/manual', data)
      showToast('success', 'settings.recharges.created')
      return response
    } catch (error) {
      handleError(error, 'settings.recharges.error_create')
      return null
    }
  }

  return {
    getOrganization,
    getOrganizations,
    getRecharges,
    createManualRecharge,
  }
}
