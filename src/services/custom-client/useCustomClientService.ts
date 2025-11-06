import { useApiClient } from '@/composables/useApiClient'

import type { ICreateClientResponse } from './interfaces/client-response.interface'
import type {
  ICreateClientWithCustomPlanDto,
  ICreateClientWithExistingPlanDto,
} from './interfaces/create-client.interface'

export const useCustomClientService = () => {
  const apiClient = useApiClient(true)

  const createWithExistingPlan = async (
    planId: string,
    data: ICreateClientWithExistingPlanDto
  ): Promise<ICreateClientResponse> => {
    return apiClient.post<ICreateClientResponse, ICreateClientWithExistingPlanDto>(
      `/organizations/clients/with-existing-plan/${planId}`,
      data
    )
  }

  const createWithCustomPlan = async (
    data: ICreateClientWithCustomPlanDto
  ): Promise<ICreateClientResponse> => {
    return apiClient.post<ICreateClientResponse, ICreateClientWithCustomPlanDto>(
      '/organizations/clients/with-custom-plan',
      data
    )
  }

  return {
    createWithExistingPlan,
    createWithCustomPlan,
  }
}
