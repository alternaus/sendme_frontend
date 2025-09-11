import { useApiClient } from '@/composables/useApiClient'
import type {
  Organization,
  TermsAcceptance,
  TermsAcceptanceRequest
} from '@/services/interfaces/terms.interface'

export class TermsService {
  private api = useApiClient(true)

  async acceptTerms(organizationId: string, request: TermsAcceptanceRequest): Promise<TermsAcceptance> {
    // TEMPORAL: Simular aceptación exitosa de términos
    console.log('Accepting terms for org:', organizationId, 'with version:', request.termsVersion)

    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Retornar datos simulados
    return {
      id: `acceptance-${Date.now()}`,
      organizationId,
      termsVersion: request.termsVersion,
      acceptedAt: new Date().toISOString(),
      ip: '127.0.0.1',
      userAgent: navigator.userAgent,
      acceptedBy: 'current-user-id'
    }

    /* CÓDIGO ORIGINAL (comentado temporalmente):
    return this.api.post<TermsAcceptance>(`/organizations/${organizationId}/accept-terms`, request)
    */
  }

  async getTermsAcceptances(organizationId: string): Promise<TermsAcceptance[]> {
    return this.api.get<TermsAcceptance[]>(`/organizations/${organizationId}/terms-acceptances`)
  }

  async getOrganization(organizationId: string): Promise<Organization> {
    return this.api.get<Organization>(`/organizations/${organizationId}`)
  }

  async checkTermsAcceptance(organizationId: string): Promise<{
    hasAccepted: boolean
    version?: string
    acceptedAt?: string
  }> {
    // TEMPORAL: Para testing, siempre devolver que los términos no están aceptados
    // Esto hará que el modal se muestre automáticamente
    console.log('Checking terms for org:', organizationId)

    // Simular un pequeño delay como si fuera una llamada real a la API
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      hasAccepted: false // Cambiar a true para simular términos aceptados
    }

    /* CÓDIGO ORIGINAL (comentado temporalmente):
    try {
      const organization = await this.getOrganization(organizationId)

      const hasAccepted = !!(
        organization.termsAcceptedVersion &&
        organization.termsAcceptedAt
      )

      return {
        hasAccepted,
        version: organization.termsAcceptedVersion,
        acceptedAt: organization.termsAcceptedAt
      }
    } catch (error) {
      console.error('Error verificando términos:', error)
      return { hasAccepted: false }
    }
    */
  }
}

export const termsService = new TermsService()
