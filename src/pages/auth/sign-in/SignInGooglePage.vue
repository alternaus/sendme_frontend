<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ProgressSpinner from 'primevue/progressspinner'

import { useI18n } from 'vue-i18n'

import { useAuthService } from '@/services/auth/useAuthService'
import { useAuthStore } from '@/stores/useAuthStore'

export default defineComponent({
  name: 'GoogleCallback',
  components: {
    ProgressSpinner
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { t } = useI18n()
    const authStore = useAuthStore()
    const authService = useAuthService()

    onMounted(async () => {
      const code = route.query.code as string

      if (!code) {
        router.push('/auth/sign-in')
        return
      }

      try {
        const data = await authService.handleGoogleCallback(code)

        if (data.accessToken) {
          authStore.setAuthData(data.accessToken, data.refreshToken)

          const userData = await authService.me()
          authStore.user = userData
          localStorage.setItem('user', JSON.stringify(userData))

          router.push('/')
        } else {
          throw new Error('No se recibió el token de acceso')
        }
      } catch {
        router.push('/auth/sign-in')
      }
    })

    return {
      t
    }
  },
})
</script>

<template>
  <div class="flex justify-center items-center">
    <div class="text-center">
      <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" />
      <h2 class="text-xl font-semibold mt-4">{{ t('auth.processing_login') }}</h2>
    </div>
  </div>
</template>
