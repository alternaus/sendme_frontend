import { computed, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

import router from '@/router'
import { useAuthService } from '@/services/auth/useAuthService'
import type { IUser } from '@/services/user/interfaces/user.interface'

export const useAuthStore = defineStore('auth', () => {
  const { t } = useI18n()
  const authService = useAuthService()
  const toast = useToast()

  const token = ref<string | null>(localStorage.getItem('token') || null)

  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken') || null)
  const user = ref<IUser | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  )
  
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const setAuthData = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  

  const clearAuthData = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      errorMessage.value = null

      const response = await authService.login({ email, password })
      setAuthData(response.accessToken);
      
      const userData = await authService.me()
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))

      toast.add({
        severity: 'success',
        summary: t('auth.successful_login'),
        // detail: 'Has iniciado sesión correctamente.',
        life: 3000,
      })

      router.push('/')
    } catch (error) {
      console.error('❌ Error en login:', error)
      errorMessage.value = t('auth.incorrect_credentials')

      toast.add({
        severity: 'error',
        summary: t('auth.login_error'),
        detail: t('auth.incorrect_email_password'),
        life: 3000,
      })
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    clearAuthData()

    toast.add({
      severity: 'info',
      summary: t('auth.sesion_closed'),
      // detail: 'Has cerrado sesión correctamente.',
      life: 3000,
    })

    router.push('/auth/sign-in')
  }

  return {
    token,
    refreshToken,
    user,
    loading,
    errorMessage,
    isAuthenticated,
    login,
    logout,
  }
})
