import { defineStore } from 'pinia'

import type { TermsStatus } from '@/services/interfaces/terms.interface'
import { termsService } from '@/services/terms/terms.service'

interface TermsState {
  termsStatusByOrg: Record<string, TermsStatus>
  showModal: boolean
  currentOrganizationId: string | null
  isCheckingTerms: boolean
}

export const useTermsStore = defineStore('terms', {
  state: (): TermsState => ({
    termsStatusByOrg: {},
    showModal: false,
    currentOrganizationId: null,
    isCheckingTerms: false
  }),

  getters: {
    getTermsStatus: (state) => (organizationId: string): TermsStatus => {
      return state.termsStatusByOrg[organizationId] || {
        hasAccepted: false,
        loading: false
      }
    },

    hasAcceptedTerms: (state) => (organizationId: string): boolean => {
      const status = state.termsStatusByOrg[organizationId]
      return status?.hasAccepted || false
    },

    isModalVisible: (state) => state.showModal
  },

  actions: {
    async checkTermsAcceptance(organizationId: string, forceRefresh = false) {
      if (!organizationId) return

      console.log('Checking terms acceptance for org:', organizationId)

      const cached = this.termsStatusByOrg[organizationId]
      if (cached && !forceRefresh && !cached.loading) {
        console.log('Using cached terms status:', cached)
        return cached
      }

      this.setTermsStatus(organizationId, {
        hasAccepted: false,
        loading: true
      })

      try {
        const status = await termsService.checkTermsAcceptance(organizationId)

        console.log('Terms check result:', status)

        this.setTermsStatus(organizationId, {
          ...status,
          loading: false,
          error: undefined
        })

        return status
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error verificando términos'

        console.error('Error checking terms:', error)

        this.setTermsStatus(organizationId, {
          hasAccepted: false,
          loading: false,
          error: errorMessage
        })

        return { hasAccepted: false, error: errorMessage }
      }
    },

    async acceptTerms(organizationId: string, termsVersion: string) {
      if (!organizationId) {
        throw new Error('Organization ID is required')
      }

      try {
        this.isCheckingTerms = true

        const result = await termsService.acceptTerms(organizationId, {
          termsVersion
        })

        this.setTermsStatus(organizationId, {
          hasAccepted: true,
          version: result.termsVersion,
          acceptedAt: result.acceptedAt,
          loading: false,
          error: undefined
        })

        this.hideModal()
        return result
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const responseError = error as { response?: { data?: { code?: string } } }
          if (responseError.response?.data?.code === '1021') {
            this.setTermsStatus(organizationId, {
              hasAccepted: true,
              loading: false,
              error: undefined
            })
            this.hideModal()
            return { success: true, alreadyAccepted: true }
          }
        }

        throw error
      } finally {
        this.isCheckingTerms = false
      }
    },

    setTermsStatus(organizationId: string, status: TermsStatus) {
      this.termsStatusByOrg[organizationId] = status
    },

    showTermsModal(organizationId: string) {
      console.log('Showing terms modal for org:', organizationId)
      this.currentOrganizationId = organizationId
      this.showModal = true
      console.log('Modal state set to:', this.showModal)
    },

    hideModal() {
      this.showModal = false
      this.currentOrganizationId = null
    },

    clearTermsStatus(organizationId?: string) {
      if (organizationId) {
        delete this.termsStatusByOrg[organizationId]
      } else {
        this.termsStatusByOrg = {}
      }
    }
  }
})
