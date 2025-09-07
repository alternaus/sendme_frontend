import { computed, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import type { IOAuthStatus, OAuthProviderType } from '@/services/auth/interfaces/oauth.interface'
import { useAuthService } from '@/services/auth/useAuthService'

export const useOAuth = () => {
  const authService = useAuthService()
  const toast = useToast()
  const { t } = useI18n()

  const loading = ref(false)
  const status = ref<Record<OAuthProviderType, IOAuthStatus | null>>({
    google: null,
    facebook: null,
    microsoft: null
  })

  const initiateOAuth = async (provider: OAuthProviderType, returnPath?: string, userId?:string) => {
    try {
      loading.value = true

      if (returnPath) {
        localStorage.setItem(`${provider}AuthReturnPath`, returnPath)
      }

      const response = await authService.getOAuthUrl(provider, userId)
      window.location.href = response.url
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('common.general.error'),
        detail: t('auth.oauth_init_error', { provider }),
        life: 5000
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const checkOAuthStatus = async (provider: OAuthProviderType) => {
    try {
      const response = await authService.checkOAuthStatus(provider)
      status.value[provider] = response
      return response
    } catch (error) {
      status.value[provider] = {
        hasValidTokens: false,
        message: t('auth.oauth_status_check_error', { provider }),
        provider
      }
      throw error
    }
  }

  const revokeOAuthTokens = async (provider: OAuthProviderType) => {
    try {
      await authService.revokeOAuthTokens(provider)
      status.value[provider] = {
        hasValidTokens: false,
        provider
      }

      toast.add({
        severity: 'success',
        summary: t('common.general.success'),
        detail: t('auth.oauth_tokens_revoked', { provider }),
        life: 3000
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('common.general.error'),
        detail: t('auth.oauth_revoke_error', { provider }),
        life: 5000
      })
      throw error
    }
  }

  const hasValidTokens = computed(() => (provider: OAuthProviderType) => {
    return status.value[provider]?.hasValidTokens ?? false
  })

  const getReauthUrl = computed(() => (provider: OAuthProviderType) => {
    return status.value[provider]?.reauthUrl
  })

  const getStatusMessage = computed(() => (provider: OAuthProviderType) => {
    return status.value[provider]?.message
  })

  return {
    loading,
    status,
    initiateOAuth,
    checkOAuthStatus,
    revokeOAuthTokens,
    hasValidTokens,
    getReauthUrl,
    getStatusMessage
  }
}
