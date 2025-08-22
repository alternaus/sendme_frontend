import { ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { useApiClient } from '@/composables/useApiClient'

import type { IPlan } from './interfaces/plan.interface'

export const usePlanService = () => {
  const publicApi = useApiClient(false)
  const toast = useToast()
  const { t } = useI18n()

  const plans = ref<IPlan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  /**
   * Fetch all available plans
   */
  const fetchPlans = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await publicApi.get<IPlan[]>('/plans')
      plans.value = data
      return data
    } catch (err) {
      error.value = 'enrollment.error_loading_plans'
      handleError(err, 'enrollment.error_loading_plans')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get plan details by ID
   */
  const getPlanById = async (id: string | number) => {
    loading.value = true
    error.value = null

    try {
      const data = await publicApi.get<IPlan>(`/plans/${id}`)
      return data
    } catch (err) {
      error.value = 'enrollment.error_loading_plan_details'
      handleError(err, 'enrollment.error_loading_plan_details')
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    plans,
    loading,
    error,
    fetchPlans,
    getPlanById
  }
}
