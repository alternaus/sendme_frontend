<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import type { OAuthProviderType } from '@/services/auth/interfaces/oauth.interface'
import { useAuthService } from '@/services/auth/useAuthService'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const toast = useToast()
const authStore = useAuthStore()
const authService = useAuthService()

const provider = ref<OAuthProviderType>('google')
const loading = ref(true)
const error = ref<string | null>(null)

const getDescription = () => {
  if (loading.value) {
    return t('auth.oauth_processing_description', { provider: getProviderDisplayName() })
  } else if (error.value) {
    return t('auth.oauth_error_description')
  } else {
    return t('auth.oauth_success_description', { provider: getProviderDisplayName() })
  }
}

const getProviderDisplayName = () => {
  const providerNames = {
    google: 'Google',
    facebook: 'Facebook',
    microsoft: 'Microsoft'
  }
  return providerNames[provider.value] || provider.value
}


onMounted(async () => {
  const routeProvider = route.params.provider as string

  if (!['google', 'facebook', 'microsoft'].includes(routeProvider)) {
    router.push('/auth/sign-in')
    return
  }

  provider.value = routeProvider as OAuthProviderType

  const code = route.query.code as string
  const state = route.query.state as string

  if (!code) {
    router.push('/auth/sign-in')
    return
  }

  try {
    const data = await authService.handleOAuthCallback(provider.value, code, state)

    if (data.accessToken) {
      authStore.setAuthData(data.accessToken, data.refreshToken || '')

      const userData = await authService.me()
      authStore.user = userData
      localStorage.setItem('user', JSON.stringify(userData))

      const returnPath = localStorage.getItem(`${provider.value}AuthReturnPath`)
      if (returnPath) {
        localStorage.removeItem(`${provider.value}AuthReturnPath`)
        router.push(returnPath)
      } else {
        router.push('/')
      }
    } else {
      throw new Error('No se recibió el token de acceso')
    }
  } catch (err: unknown) {
    console.error(`Error en callback de ${provider.value}:`, err)
    error.value = t('auth.oauth_callback_error', { provider: provider.value })

    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: error.value,
      life: 5000
    })

    setTimeout(() => {
      router.push('/auth/sign-in')
    }, 3000)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class=" flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ getDescription() }}
        </p>
      </div>

      <div  class="mt-8">
        <div v-if="loading" class="text-center">
          <div class="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
            <div class="animate-pulse">
              <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4 mx-auto mb-4"></div>
              <div class="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>

        <div  v-else-if="error" class="text-center">
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div class="text-red-800 dark:text-red-200">
              <h3 class="text-lg font-medium mb-2">
                {{ t('auth.oauth_error_title') }}
              </h3>
              <p class="text-sm mb-4">{{ error }}</p>
            </div>
          </div>
        </div>

        <div  v-else class="text-center">
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div class="text-green-800 dark:text-green-200">
              <h3 class="text-lg font-medium mb-2">
                {{ t('auth.oauth_success_title') }}
              </h3>
              <p class="text-sm">
                {{ t('auth.oauth_success_description', { provider: getProviderDisplayName() }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
