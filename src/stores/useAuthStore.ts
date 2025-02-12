import { computed,ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { defineStore } from 'pinia'

import router from '@/router'
import { useAuthService } from '@/services/auth/useAuthService'

export const useAuthStore = defineStore('auth', () => {
  const authService = useAuthService()
  const toast = useToast()

  const token = ref<string | null>(localStorage.getItem('token') || null)
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken') || null)
  const user = ref<Record<string, unknown> | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const setAuthData = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const clearAuthData = () => {
    token.value = null
    localStorage.removeItem('token')
  }

  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      errorMessage.value = null

      const response = await authService.login({ email, password })
      console.log('✅ Login:', response)
      setAuthData(response.accessToken)

      toast.add({
        severity: 'success',
        summary: 'Inicio de sesión exitoso',
        detail: 'Has iniciado sesión correctamente.',
        life: 3000,
      })

      router.push('/')
    } catch (error) {
      console.error('❌ Error en login:', error)
      errorMessage.value = 'Credenciales incorrectas'

      toast.add({
        severity: 'error',
        summary: 'Error de inicio de sesión',
        detail: 'Correo o contraseña incorrectos.',
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
      summary: 'Sesión cerrada',
      detail: 'Has cerrado sesión correctamente.',
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
