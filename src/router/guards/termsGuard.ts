import type { NavigationGuard } from 'vue-router'

import { useTermsStore } from '@/stores/termsStore'

/**
 * Guard de navegación para verificar términos aceptados
 * @param organizationId - ID de la organización (puede ser dinámico)
 * @returns Navigation guard
 */
export function createTermsGuard(organizationId?: string | (() => string | null)): NavigationGuard {
  return async (to, from, next) => {
    const termsStore = useTermsStore()

    // Obtener el organizationId
    let orgId: string | null = null

    if (typeof organizationId === 'function') {
      orgId = organizationId()
    } else if (typeof organizationId === 'string') {
      orgId = organizationId
    } else {
      // Intentar obtener de los parámetros de la ruta
      orgId = to.params.organizationId as string || null
    }

    if (!orgId) {
      // Si no hay organizationId, permitir la navegación
      next()
      return
    }

    try {
      // Verificar el estado de los términos
      const status = await termsStore.checkTermsAcceptance(orgId)

      if (!status?.hasAccepted) {
        // Mostrar modal de términos
        termsStore.showTermsModal(orgId)

        // Esperar a que se resuelva el modal
        return new Promise((resolve) => {
          const unwatch = termsStore.$subscribe((mutation, state) => {
            if (!state.showModal) {
              unwatch()
              // Verificar si se aceptaron los términos
              const updatedStatus = termsStore.getTermsStatus(orgId!)
              if (updatedStatus.hasAccepted) {
                resolve(next())
              } else {
                // Si no se aceptaron, permanecer en la ruta actual o redirigir
                resolve(next(false))
              }
            }
          })
        })
      }

      // Los términos están aceptados, continuar
      next()
    } catch (error) {
      console.error('Error checking terms in route guard:', error)
      // En caso de error, permitir la navegación por defecto
      next()
    }
  }
}

/**
 * Guard simple que verifica términos para una organización específica
 */
export const termsGuard = createTermsGuard()

/**
 * Función helper para usar en rutas con organizationId dinámico
 */
export function withTermsGuard(getOrganizationId: () => string | null) {
  return createTermsGuard(getOrganizationId)
}
