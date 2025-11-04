import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import { useErrorHandler } from '@/composables/useErrorHandler'
import { API_URL } from '@/helpers/api-url.helper'
import router from '@/router'


const publicApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

const privateApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const onRefreshError = () => {
  refreshSubscribers = []
}

privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

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
    const originalRequest = error.config

    if (error.response) {
      const { status, data } = error.response

      const isTokenError = status === 401 || (data?.code && ['1008', '1009'].includes(data.code))

      if (isTokenError && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((token) => {
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(axios(originalRequest))
              } else {
                reject(error)
              }
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = localStorage.getItem('refreshToken')

          if (!refreshToken) {
            throw new Error('No hay refresh token disponible')
          }

          const response = await publicApi.post('/auth/refresh', { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = response.data

          localStorage.setItem('token', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          onTokenRefreshed(accessToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          isRefreshing = false
          return axios(originalRequest)
        } catch (refreshError) {
          isRefreshing = false

          onRefreshError()

          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          router.push('/auth/sign-in')
          return Promise.reject(refreshError)
        }
      }

      if (status === 403) {
      }

      // Manejar error de términos no aceptados
      if (data?.code === '1022') {
        // El error será manejado por el composable useTermsAcceptance
        // No necesitamos hacer nada especial aquí, solo pasar el error
      }

      if (status >= 500) {
      }
    }

    return Promise.reject(error)
  },
)

const useApiClient = (isAuthenticated = false) => {
  const api = isAuthenticated ? privateApi : publicApi
  const { handleError } = useErrorHandler()

  return {
    get: async <T>(url: string, config?: AxiosRequestConfig, customErrorMessage?: string, showToast = true): Promise<T> => {
      try {
        const response: AxiosResponse<T> = await api.get(url, config)
        return response.data
      } catch (error) {
        const errorMessage = handleError(error, customErrorMessage, showToast)
        throw new Error(errorMessage)
      }
    },

    post: async <T, R = unknown>(
      url: string,
      data?: R,
      config?: AxiosRequestConfig,
      customErrorMessage?: string,
      showToast = true,
    ): Promise<T> => {
      try {
        const response: AxiosResponse<T> = await api.post(url, data, config)
        return response.data
      } catch (error) {
        const errorMessage = handleError(error, customErrorMessage, showToast)
        throw new Error(errorMessage)
      }
    },

    put: async <T, R = unknown>(url: string, data?: R, config?: AxiosRequestConfig, customErrorMessage?: string, showToast = true): Promise<T> => {
      try {
        const response: AxiosResponse<T> = await api.put(url, data, config)
        return response.data
      } catch (error) {
        const errorMessage = handleError(error, customErrorMessage, showToast)
        throw new Error(errorMessage)
      }
    },

    patch: async <T, R = unknown>(
      url: string,
      data?: R,
      config?: AxiosRequestConfig,
      customErrorMessage?: string,
      showToast = true,
    ): Promise<T> => {
      try {
        const response: AxiosResponse<T> = await api.patch(url, data, config)
        return response.data
      } catch (error) {
        const errorMessage = handleError(error, customErrorMessage, showToast)
        throw new Error(errorMessage)
      }
    },

    delete: async <T>(url: string, config?: AxiosRequestConfig, customErrorMessage?: string, showToast = true): Promise<T> => {
      try {
        const response: AxiosResponse<T> = await api.delete(url, config)
        return response.data
      } catch (error) {
        const errorMessage = handleError(error, customErrorMessage, showToast)
        throw new Error(errorMessage)
      }
    },
  }
}

export { useApiClient }
