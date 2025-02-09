import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import router from '@/router'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()
    const originalRequest = error.config

    if (error.response) {
      const { status } = error.response

      if (status === 401) {
        console.warn('⚠️ Token expirado o inválido')

        if (!originalRequest._retry && authStore.refreshToken) {
          originalRequest._retry = true
          try {
            const newToken = await authStore.refreshAccessToken()
            if (newToken) {
              privateApi.defaults.headers.Authorization = `Bearer ${newToken}`
              return privateApi(originalRequest)
            }
          } catch (refreshError) {
            console.error('Error al refrescar el token:', refreshError)
            authStore.logout()
            router.push('/login')
          }
        } else {
          authStore.logout()
          router.push('/login')
        }
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
