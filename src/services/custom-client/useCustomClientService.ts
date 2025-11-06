import { useApiClient } from '@/composables/useApiClient'

import type { ICreateClientResponse } from './interfaces/client-response.interface'
import type {
  ICreateClientWithCustomPlanDto,
  ICreateClientWithExistingPlanDto,
} from './interfaces/create-client.interface'
import type { ICustomClient } from './interfaces/custom-client.interface'

export const useCustomClientService = () => {
  const apiClient = useApiClient(true)

  const listCustomClients = async (): Promise<ICustomClient[]> => {
    return apiClient.get<ICustomClient[]>('/organizations/custom-clients')
  }

  const getCustomClient = async (organizationId: string): Promise<ICustomClient> => {
    return apiClient.get<ICustomClient>(`/organizations/custom-clients/${organizationId}`)
  }

  const createWithExistingPlan = async (
    planId: string,
    data: ICreateClientWithExistingPlanDto
  ): Promise<ICreateClientResponse> => {
    return apiClient.post<ICreateClientResponse, ICreateClientWithExistingPlanDto>(
      `/organizations/custom-clients/with-existing-plan/${planId}`,
      data
    )
  }

  const createWithCustomPlan = async (
    data: ICreateClientWithCustomPlanDto
  ): Promise<ICreateClientResponse> => {
    return apiClient.post<ICreateClientResponse, ICreateClientWithCustomPlanDto>(
      '/organizations/custom-clients/with-custom-plan',
      data
    )
  }

  return {
    listCustomClients,
    getCustomClient,
    createWithExistingPlan,
    createWithCustomPlan,
  }
}
