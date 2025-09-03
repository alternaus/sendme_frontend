<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ProgressSpinner from 'primevue/progressspinner'
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
  <div class="flex justify-center items-center min-h-screen">
    <div class="text-center">
      <ProgressSpinner v-if="loading" style="width: 2rem; height: 2rem" strokeWidth="4" />

      <div v-if="error" class="text-red-600 dark:text-red-400">
        <i class="pi pi-exclamation-triangle text-2xl mb-2"></i>
        <p>{{ error }}</p>
        <p class="text-sm mt-2">{{ t('auth.redirecting_to_login') }}</p>
      </div>

      <div v-else-if="loading">
        <h2 class="text-xl font-semibold mt-4">
          {{ t('auth.processing_oauth_login', { provider: provider }) }}
        </h2>
      </div>
    </div>
  </div>
</template>
