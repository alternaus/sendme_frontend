import { watch } from 'vue'
import { useRoute } from 'vue-router'

import { useTermsStore } from '@/stores/termsStore'

export function useGlobalTermsService() {
  const termsStore = useTermsStore()

  const initialize = () => {
    const route = useRoute()

    watch(
      () => route.params.organizationId,
      async (newOrgId) => {
        if (newOrgId && typeof newOrgId === 'string') {
          await checkAndShowTermsIfNeeded(newOrgId)
        }
      },
      { immediate: true }
    )

    const currentOrgId = route.params.organizationId as string
    if (currentOrgId) {
      checkAndShowTermsIfNeeded(currentOrgId)
    }
  }

  const checkAndShowTermsIfNeeded = async (organizationId: string) => {
    try {
      const status = await termsStore.checkTermsAcceptance(organizationId)

      if (!status?.hasAccepted) {
        setTimeout(() => {
          termsStore.showTermsModal(organizationId)
        }, 100)
      }
    } catch (error) {
      console.error('Error checking terms for organization:', organizationId, error)
    }
  }

  const forceCheckTerms = async (organizationId: string) => {
    await checkAndShowTermsIfNeeded(organizationId)
  }

  const getCurrentOrganizationId = (): string | null => {
    const route = useRoute()
    return route.params.organizationId as string || null
  }

  return {
    initialize,
    forceCheckTerms,
    getCurrentOrganizationId,
    checkAndShowTermsIfNeeded
  }
}
