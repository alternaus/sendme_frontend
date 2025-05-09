import { useApiClient } from '@/composables/useApiClient'

import type { DashboardResponse } from './interfaces/dashboard.interface'

export const useDashboardService = () => {
  const privateApi = useApiClient(true)

  const getDashboardData = async (): Promise<DashboardResponse | null> => {
    try {
      return await privateApi.get<DashboardResponse>('/reports/dashboard')
    } catch (error) {
      console.error('Error getting dashboard data:', error)
      return null
    }
  }

  return {
    getDashboardData,
  }
}
