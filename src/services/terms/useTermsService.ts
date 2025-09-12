import { useApiClient } from '@/composables/useApiClient'

export interface TermsStatus {
  hasAccepted: boolean
  loading: boolean
  version?: string
  acceptedAt?: string
}

interface Organization {
  id: string
  name: string
  email: string
  termsAcceptedVersion?: string
  termsAcceptedAt?: string
}

export function useTermsService() {
  const api = useApiClient(true)

  const checkAcceptance = async (organizationId: string): Promise<TermsStatus> => {
    try {
      const response = await api.get<Organization>(`/organizations/${organizationId}`)

      const hasAccepted = !!(
        response.termsAcceptedVersion &&
        response.termsAcceptedAt
      )

      return {
        hasAccepted,
        loading: false,
        version: response.termsAcceptedVersion,
        acceptedAt: response.termsAcceptedAt
      }
    } catch {
      return { hasAccepted: false, loading: false }
    }
  }

  const acceptTerms = async (organizationId: string, version: string): Promise<void> => {
    const response = await api.post(`/organizations/${organizationId}/accept-terms`, {
      termsVersion: version
    })

    if (!response) {
      throw new Error('Failed to accept terms')
    }
  }

  const isTermsError = (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'response' in error) {
      const responseError = error as { response?: { data?: { code?: string } } }
      return responseError.response?.data?.code === '1022'
    }
    return false
  }

  return {
    checkAcceptance,
    acceptTerms,
    isTermsError
  }
}
