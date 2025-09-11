import { computed, type Ref,ref, watch } from 'vue'

import type { TermsStatus } from '@/services/interfaces/terms.interface'
import { useTermsStore } from '@/stores/termsStore'

/**
 * Composable para manejar términos y condiciones
 * @param organizationId - ID de la organización
 * @returns Funciones y estado para manejar términos
 */
export function useTermsAcceptance(organizationId: string | Ref<string> | null = null) {
  const termsStore = useTermsStore()
  const currentOrgId = ref<string | null>(null)

  // Configurar el ID de organización reactivo
  if (typeof organizationId === 'string') {
    currentOrgId.value = organizationId
  } else if (organizationId) {
    currentOrgId.value = organizationId.value
    watch(organizationId, (newValue) => {
      currentOrgId.value = newValue
    })
  }

  // Estados computados
  const termsStatus = computed((): TermsStatus => {
    if (!currentOrgId.value) return { hasAccepted: false, loading: false }
    return termsStore.getTermsStatus(currentOrgId.value)
  })

  const hasAcceptedTerms = computed((): boolean => {
    if (!currentOrgId.value) return false
    return termsStore.hasAcceptedTerms(currentOrgId.value)
  })

  const isModalVisible = computed(() => termsStore.isModalVisible)
  const isCheckingTerms = computed(() => termsStore.isCheckingTerms)

  // Funciones
  const checkTermsAcceptance = async (forceRefresh = false) => {
    if (!currentOrgId.value) return
    return await termsStore.checkTermsAcceptance(currentOrgId.value, forceRefresh)
  }

  const acceptTerms = async (termsVersion: string) => {
    if (!currentOrgId.value) {
      throw new Error('Organization ID is required')
    }
    return await termsStore.acceptTerms(currentOrgId.value, termsVersion)
  }

  const showTermsModal = () => {
    if (!currentOrgId.value) return
    termsStore.showTermsModal(currentOrgId.value)
  }

  const hideModal = () => {
    termsStore.hideModal()
  }

  const requireTermsAcceptance = async (): Promise<boolean> => {
    if (!currentOrgId.value) return false

    const status = await checkTermsAcceptance()
    if (!status?.hasAccepted) {
      showTermsModal()
      return false
    }
    return true
  }

  const setOrganizationId = (orgId: string | null) => {
    currentOrgId.value = orgId
  }

  watch(currentOrgId, (newOrgId) => {
    if (newOrgId) {
      checkTermsAcceptance()
    }
  }, { immediate: true })

  return {
    // Estados
    termsStatus,
    hasAcceptedTerms,
    isModalVisible,
    isCheckingTerms,

    // Funciones
    checkTermsAcceptance,
    acceptTerms,
    showTermsModal,
    hideModal,
    requireTermsAcceptance,
    setOrganizationId
  }
}

export function useProtectedOperation(organizationId: string | Ref<string> | null = null) {
  const { requireTermsAcceptance } = useTermsAcceptance(organizationId)

  const executeProtectedOperation = async <T>(
    operation: () => Promise<T> | T,
    onTermsRequired?: () => void
  ): Promise<T | null> => {
    const canProceed = await requireTermsAcceptance()

    if (!canProceed) {
      onTermsRequired?.()
      return null
    }

    try {
      return await operation()
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { code?: string } } }
        if (responseError.response?.data?.code === '1022') {
          const canRetry = await requireTermsAcceptance()
          if (canRetry) {
            return await operation()
          }
          return null
        }
      }
      throw error
    }
  }

  return {
    executeProtectedOperation
  }
}

/**
 * Hook para interceptar errores de términos no aceptados
 */
export function useTermsErrorHandler() {
  const handleTermsError = (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'response' in error) {
      const responseError = error as { response?: { data?: { code?: string } } }
      return responseError.response?.data?.code === '1022'
    }
    return false
  }

  return {
    handleTermsError
  }
}
