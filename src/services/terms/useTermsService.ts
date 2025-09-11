import { useApiClient } from '@/composables/useApiClient'
import type {
  Organization,
  TermsAcceptance,
  TermsAcceptanceRequest
} from '@/services/interfaces/terms.interface'

export function useTermsService() {
  const api = useApiClient(true)

  async function acceptTerms(organizationId: string, request: TermsAcceptanceRequest): Promise<TermsAcceptance> {
    return api.post<TermsAcceptance>(`/organizations/${organizationId}/accept-terms`, request)
  }

  async function getTermsAcceptances(organizationId: string): Promise<TermsAcceptance[]> {
    return api.get<TermsAcceptance[]>(`/organizations/${organizationId}/terms-acceptances`)
  }

  async function getOrganization(organizationId: string): Promise<Organization> {
    return api.get<Organization>(`/organizations/${organizationId}`)
  }

  async function checkTermsAcceptance(organizationId: string): Promise<{
    hasAccepted: boolean
    version?: string
    acceptedAt?: string
  }> {
    try {
      const organization = await getOrganization(organizationId)

      const hasAccepted = !!(
        organization.termsAcceptedVersion &&
        organization.termsAcceptedAt
      )

      return {
        hasAccepted,
        version: organization.termsAcceptedVersion,
        acceptedAt: organization.termsAcceptedAt
      }
    } catch {
      return { hasAccepted: false }
    }
  }

  return {
    acceptTerms,
    getTermsAcceptances,
    getOrganization,
    checkTermsAcceptance
  }
}
