import { watch } from 'vue'
import { useRoute } from 'vue-router'

import { useTermsStore } from '@/stores/termsStore'

/**
 * Composable para manejar términos globalmente en la aplicación
 */
export function useGlobalTermsService() {
  const termsStore = useTermsStore()

  /**
   * Inicializa el sistema global de términos
   */
  const initialize = () => {
    const route = useRoute()

    // Watcher para cambios de ruta
    watch(
      () => route.params.organizationId,
      async (newOrgId) => {
        if (newOrgId && typeof newOrgId === 'string') {
          await checkAndShowTermsIfNeeded(newOrgId)
        }
      },
      { immediate: true }
    )

    // También verificar inmediatamente al inicializar
    const currentOrgId = route.params.organizationId as string
    if (currentOrgId) {
      checkAndShowTermsIfNeeded(currentOrgId)
    } else {
      // Para testing - verificar con un organizationId por defecto
      // En producción, ajusta esto según tu lógica de negocio
      checkAndShowTermsIfNeeded('test-organization-123')
    }
  }

  /**
   * Verifica y muestra términos si es necesario
   */
  const checkAndShowTermsIfNeeded = async (organizationId: string) => {
    try {
      console.log('Checking terms for organization:', organizationId)

      const status = await termsStore.checkTermsAcceptance(organizationId)

      console.log('Terms status:', status)

      if (!status?.hasAccepted) {
        console.log('Terms not accepted, showing modal...')
        // Pequeño delay para asegurar que la UI esté lista
        setTimeout(() => {
          termsStore.showTermsModal(organizationId)
        }, 100)
      }
    } catch (error) {
      console.error('Error checking terms for organization:', organizationId, error)
    }
  }

  /**
   * Fuerza la verificación de términos para una organización específica
   */
  const forceCheckTerms = async (organizationId: string) => {
    await checkAndShowTermsIfNeeded(organizationId)
  }

  /**
   * Obtiene el ID de organización actual desde la ruta
   */
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
