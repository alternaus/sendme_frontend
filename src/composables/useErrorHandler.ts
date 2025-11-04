import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

interface ErrorResponse {
  statusCode?: number
  message?: string
  code?: string
  error?: unknown
}

interface AxiosError {
  response?: {
    data?: ErrorResponse
  }
}

export const useErrorHandler = () => {
  const { t } = useI18n()
  const toast = useToast()

  const getErrorMessage = (error: ErrorResponse, customMessage?: string): string => {
    if (error.code) {
      const translationKey = `common.errors.${error.code}`
      const translatedMessage = t(translationKey)

      if (translatedMessage !== translationKey) {
        return translatedMessage
      }
    }

    if (customMessage) {
      return customMessage
    }

    if (error.message) {
      return error.message
    }

    return t('common.errors.default')
  }

  const showErrorToast = (error: ErrorResponse, customMessage?: string): void => {
    const message = getErrorMessage(error, customMessage)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    })
  }

  const formatError = (error: unknown, customMessage?: string): string => {
    const axiosError = error as AxiosError
    const errorData: ErrorResponse = axiosError?.response?.data || (error as ErrorResponse)

    return getErrorMessage(errorData, customMessage)
  }

  const handleError = (error: unknown, customMessage?: string, showToast = true): string => {
    const axiosError = error as AxiosError
    const errorData: ErrorResponse = axiosError?.response?.data || (error as ErrorResponse)

    if (showToast) {
      showErrorToast(errorData, customMessage)
    }

    return getErrorMessage(errorData, customMessage)
  }

  return {
    getErrorMessage,
    formatError,
    showErrorToast,
    handleError
  }
}
