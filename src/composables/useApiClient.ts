import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import router from '@/router'
import { useAuthStore } from '@/stores/useAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const privateApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

privateApi.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token || localStorage.getItem('token')

    console.log('🔑 Token:', token)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()

    if (error.response) {
      const { status } = error.response

      if (status === 401) {
        console.warn('⚠️ Token expirado o inválido. Cerrando sesión...')
        authStore.logout()
        return router.push('/auth/sign-in')
      }

      if (status === 403) {
        console.warn('🚫 No tienes permisos para esta acción')
      }

      if (status >= 500) {
        console.error('🔥 Error interno del servidor')
      }
    }

    return Promise.reject(error)
  },
)

const useApiClient = (isAuthenticated = false) => {
  const api = isAuthenticated ? privateApi : publicApi

  return {
    get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      const response: AxiosResponse<T> = await api.get(url, config)
      return response.data
    },

    post: async <T, R = unknown>(
      url: string,
      data?: R,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const response: AxiosResponse<T> = await api.post(url, data, config)
      return response.data
    },

    put: async <T, R = unknown>(url: string, data?: R, config?: AxiosRequestConfig): Promise<T> => {
      const response: AxiosResponse<T> = await api.put(url, data, config)
      return response.data
    },

    patch: async <T, R = unknown>(
      url: string,
      data?: R,
      config?: AxiosRequestConfig,
    ): Promise<T> => {
      const response: AxiosResponse<T> = await api.patch(url, data, config)
      return response.data
    },

    delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
      const response: AxiosResponse<T> = await api.delete(url, config)
      return response.data
    },
  }
}

export { useApiClient }
