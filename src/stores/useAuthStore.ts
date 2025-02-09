import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'

import { useApiClient } from '@/composables/useApiClient'

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface AuthResponse {
  token: string
  refreshToken: string
  user: Record<string, unknown>
}

export const useAuthService = defineStore('auth', () => {
  const router = useRouter()
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken') || null)
  const user = ref<Record<string, unknown> | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const publicApi = useApiClient(isAuthenticated.value)
  const privateApi = useApiClient()

  const login = async (credentials: ILogin) => {
    try {
      loading.value = true
      errorMessage.value = null

      const response = await publicApi.post<AuthResponse>('/auth/login', credentials)
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken
      user.value = response.data.user

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('refreshToken', response.data.refreshToken)

      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Error en login:', error)
      errorMessage.value = 'Credenciales incorrectas'
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterPayload) => {
    try {
      loading.value = true
      errorMessage.value = null

      const response = await publicApi.post<AuthResponse>('/auth/register', userData)
      token.value = response.data.token
      refreshToken.value = response.data.refreshToken
      user.value = response.data.user

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('refreshToken', response.data.refreshToken)

      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Error en registro:', error)
      errorMessage.value = 'Error al registrar usuario'
    } finally {
      loading.value = false
    }
  }

  const refreshAuthToken = async () => {
    try {
      if (!refreshToken.value) throw new Error('No hay refresh token')

      const response = await publicApi.post<{ token: string }>('/auth/refresh', {
        refreshToken: refreshToken.value,
      })

      token.value = response.data.token
      localStorage.setItem('token', response.data.token)
    } catch (error) {
      console.error('❌ Error al refrescar el token:', error)
      logout()
    }
  }

  const logout = async () => {
    try {
      await privateApi.post('/auth/logout')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
    } finally {
      token.value = null
      refreshToken.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      router.push('/login')
    }
  }

  return {
    token,
    refreshToken,
    user,
    isAuthenticated,
    login,
    register,
    refreshAuthToken,
    logout,
    loading,
    errorMessage,
  }
})
