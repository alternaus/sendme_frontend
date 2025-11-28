import { useApiClient } from '@/composables/useApiClient'

import type { IPaginationResponse } from '../interfaces/pagination-response.interface'
import type { IClientDetailsResponse } from './interfaces/client-details.interface'
import type { ICreateClientResponse } from './interfaces/client-response.interface'
import type {
  ICreateClientWithCustomPlanDto,
  ICreateClientWithExistingPlanDto,
} from './interfaces/create-client.interface'
import type { ICreateManualRecharge } from './interfaces/create-manual-recharge.interface'
import type { IFilterRecharge } from './interfaces/filter-recharge.interface'
import type { IOrganization } from './interfaces/organization.interface'
import type { IRecharge } from './interfaces/recharge.interface'
import type { IUpdateClientDto } from './interfaces/update-client.interface'

export const useOrganizationService = () => {
  const privateApi = useApiClient(true)

  const getOrganization = async (id: string) => {
    return privateApi.get<IOrganization>(`/organizations/${id}`)
  }

  const listOrganizations = async () => {
    return privateApi.get<IOrganization[]>('/organizations')
  }

  const getClientDetails = async (id: string) => {
    return privateApi.get<IClientDetailsResponse>(`/organizations/clients/${id}/details`)
  }

  const updateClient = async (id: string, data: IUpdateClientDto) => {
    return privateApi.patch<void>(`/organizations/clients/${id}`, data)
  }

  const listRecharges = async (query?: IFilterRecharge) => {
    return privateApi.get<IPaginationResponse<IRecharge>>('/recharges', { params: { ...query } })
  }

  const createManualRecharge = async (data: ICreateManualRecharge) => {
    return privateApi.post<IRecharge>('/recharges/manual', data)
  }

  const createClientWithExistingPlan = async (
    planId: string,
    data: ICreateClientWithExistingPlanDto
  ): Promise<ICreateClientResponse> => {
    return privateApi.post<ICreateClientResponse, ICreateClientWithExistingPlanDto>(
      `/organizations/clients/with-existing-plan/${planId}`,
      data
    )
  }

  const createClientWithCustomPlan = async (
    data: ICreateClientWithCustomPlanDto
  ): Promise<ICreateClientResponse> => {
    return privateApi.post<ICreateClientResponse, ICreateClientWithCustomPlanDto>(
      '/organizations/clients/with-custom-plan',
      data
    )
  }

  return {
    getOrganization,
    listOrganizations,
    listRecharges,
    createManualRecharge,
    createClientWithExistingPlan,
    createClientWithCustomPlan,
    getClientDetails,
    updateClient
  }
}
