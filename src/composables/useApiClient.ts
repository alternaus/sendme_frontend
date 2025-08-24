import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import router from '@/router'

const isProd = import.meta.env.MODE === 'production'

const API_BASE_URL = isProd
  ? `${window.location.origin}/api`
  : import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const privateApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

//Variable para evitar múltiples solicitudes de refreshToken simultáneas
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

//Función para añadir suscriptores que esperan el nuevo token
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

//Función para notificar a los suscriptores cuando se refresca el token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

//Función para rechazar todos los suscriptores en caso de error
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

      //Verificar si es un error de token expirado o inválido
      const isTokenError = status === 401 ||
                           (data?.code && ['1008', '1009'].includes(data.code))

      //Si el token ha expirado y no estamos ya intentando refrescarlo
      if (isTokenError && !originalRequest._retry) {
        if (isRefreshing) {
          //Si ya estamos refrescando, añadimos este request a la cola
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

          //Si no hay refresh token, hacemos logout
          if (!refreshToken) {
            throw new Error('No hay refresh token disponible')
          }

          //Intentamos obtener un nuevo token
          const response = await publicApi.post('/auth/refresh', { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = response.data

          //Guardamos los nuevos tokens
          localStorage.setItem('token', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          //Notificamos a todos los requests en espera
          onTokenRefreshed(accessToken)

          //Retomamos el request original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          isRefreshing = false
          return axios(originalRequest)
        } catch (refreshError) {
          isRefreshing = false

          //Notificar a todos los requests en cola que hubo un error
          onRefreshError()

          //Limpiar tokens y redirigir al login
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          router.push('/auth/sign-in')
          return Promise.reject(refreshError)
        }
      }

      if (status === 403) {
      }

      if (status >= 500) {
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
