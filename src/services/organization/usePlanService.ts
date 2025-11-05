import { useApiClient } from '@/composables/useApiClient'

import type { IPlan } from './interfaces/plan.interface'

export const usePlanService = () => {
  const publicApi = useApiClient(false)

  const listPlans = async () => {
    return publicApi.get<IPlan[]>('/plans')
  }

  const getPlan = async (id: string | number) => {
    return publicApi.get<IPlan>(`/plans/${id}`)
  }

  return {
    listPlans,
    getPlan
  }
}
