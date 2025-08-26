import { computed, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

import router from '@/router'
import type { ISignUp } from '@/services/auth/interfaces'
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

  const setAuthData = (newToken: string, newRefreshToken: string) => {
    token.value = newToken
    refreshToken.value = newRefreshToken
    localStorage.setItem('token', newToken)
    localStorage.setItem('refreshToken', newRefreshToken)
  }

  const clearAuthData = () => {
    token.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      errorMessage.value = null

      const response = await authService.login({ email, password })
      setAuthData(response.accessToken, response.refreshToken);

      const userData = await authService.me()
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))

      toast.add({
        severity: 'success',
        summary: t('auth.successful_login'),
        life: 3000,
      })

      router.push('/')
    } catch {
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

  const signUp = async (payload: ISignUp) => {
    try {
      loading.value = true
      errorMessage.value = null

      const response = await authService.signUp(payload)
      setAuthData(response.accessToken, response.refreshToken)

      const userData = await authService.me()
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))

      toast.add({
        severity: 'success',
        summary: t('auth.successful_signup'),
        life: 3000,
      })

      router.push('/')
    } catch {
      errorMessage.value = t('auth.signup_error')

      toast.add({
        severity: 'error',
        summary: t('auth.signup_error'),
        detail: t('auth.signup_error_detail'),
        life: 3000,
      })
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await authService.logout()
      }
    } catch  {
    } finally {
      clearAuthData()

      toast.add({
        severity: 'info',
        summary: t('auth.sesion_closed'),
        life: 3000,
      })

      router.push('/auth/sign-in')
    }
  }

  const refreshUserToken = async () => {
    if (!refreshToken.value) return false

    try {
      loading.value = true
      const response = await authService.refreshAuthToken(refreshToken.value)
      setAuthData(response.accessToken, response.refreshToken)
      return true
    } catch {
      return false
    } finally {
      loading.value = false
    }
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
    setAuthData,
    refreshUserToken
    ,signUp
  }
})
