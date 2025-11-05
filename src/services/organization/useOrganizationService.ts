import { useApiClient } from '@/composables/useApiClient'

import type { IPaginationResponse } from '../interfaces/pagination-response.interface'
import type { ICreateManualRecharge } from './interfaces/create-manual-recharge.interface'
import type { IFilterRecharge } from './interfaces/filter-recharge.interface'
import type { IOrganization } from './interfaces/organization.interface'
import type { IRecharge } from './interfaces/recharge.interface'

export const useOrganizationService = () => {
  const privateApi = useApiClient(true)

  const getOrganization = async (id: string) => {
    return privateApi.get<IOrganization>(`/organizations/${id}`)
  }

  const listOrganizations = async () => {
    return privateApi.get<IOrganization[]>('/organizations')
  }

  const listRecharges = async (query?: IFilterRecharge) => {
    return privateApi.get<IPaginationResponse<IRecharge>>('/recharges', { params: { ...query } })
  }

  const createManualRecharge = async (data: ICreateManualRecharge) => {
    return privateApi.post<IRecharge>('/recharges/manual', data)
  }

  return {
    getOrganization,
    listOrganizations,
    listRecharges,
    createManualRecharge,
  }
}
