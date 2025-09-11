import { watch } from 'vue'

import { useTermsStore } from '@/stores/termsStore'
import { useAuthStore } from '@/stores/useAuthStore'

export function useGlobalTermsService() {
  const termsStore = useTermsStore()
  const authStore = useAuthStore()

  const initialize = () => {
    console.log('🚀 Initializing global terms service')

    // Verificar términos cuando el usuario esté autenticado
    watch(
      () => authStore.user,
      async (user) => {
        console.log('� User changed:', user)
        if (user?.organizationId) {
          console.log('🏢 Found organizationId in user:', user.organizationId)
          await checkAndShowTermsIfNeeded(user.organizationId)
        }
      },
      { immediate: true }
    )

    // También verificar si ya hay un usuario autenticado
    if (authStore.user?.organizationId) {
      console.log('🏢 User already authenticated with organizationId:', authStore.user.organizationId)
      checkAndShowTermsIfNeeded(authStore.user.organizationId)
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
    return authStore.user?.organizationId || null
  }

  return {
    initialize,
    forceCheckTerms,
    getCurrentOrganizationId,
    checkAndShowTermsIfNeeded
  }
}
