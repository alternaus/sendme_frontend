import { computed, type Ref,ref, watch } from 'vue'

import { type TermsStatus,useTermsService } from '@/services/terms/useTermsService'

export function useTerms(organizationId: string | Ref<string>) {
  const { checkAcceptance, acceptTerms: acceptTermsApi, isTermsError } = useTermsService()

  const status = ref<TermsStatus>({ hasAccepted: false, loading: false })
  const isModalVisible = ref(false)
  const isAccepting = ref(false)

  const orgId = computed(() =>
    typeof organizationId === 'string' ? organizationId : organizationId.value
  )

  const hasAccepted = computed(() => status.value.hasAccepted)
  const isLoading = computed(() => status.value.loading || isAccepting.value)

  const checkStatus = async () => {
    if (!orgId.value) return

    status.value.loading = true
    try {
      status.value = await checkAcceptance(orgId.value)
    } catch (error) {
      status.value = { hasAccepted: false, loading: false }
      throw error
    }
  }

  const acceptTerms = async (version = '1.0.0') => {
    if (!orgId.value) throw new Error('Organization ID required')

    isAccepting.value = true
    try {
      await acceptTermsApi(orgId.value, version)
      status.value.hasAccepted = true
      isModalVisible.value = false
    } finally {
      isAccepting.value = false
    }
  }

  const showModal = () => {
    isModalVisible.value = true
  }

  const hideModal = () => {
    isModalVisible.value = false
  }

  const handleOperationError = (error: unknown): boolean => {
    if (isTermsError(error)) {
      showModal()
      return true
    }
    return false
  }

  watch(orgId, checkStatus, { immediate: true })

  return {
    hasAccepted,
    isLoading,
    isModalVisible,
    isAccepting,
    checkStatus,
    acceptTerms,
    showModal,
    hideModal,
    handleOperationError
  }
}
