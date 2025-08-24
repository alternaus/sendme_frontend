import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { useApiClient } from '@/composables/useApiClient'
import type { IAudit } from '@/services/report/interfaces/audit.interface'
import type { IFilterAudit } from '@/services/report/interfaces/filter-audit.interface'
import type { IFilterMessage } from '@/services/report/interfaces/filter-message.interface'
import type { IMessage } from '@/services/report/interfaces/message.interface'

import type { IPaginationResponse } from '../interfaces/pagination-response.interface'

export const useReportService = () => {
  const privateApi = useApiClient(true)
  const toast = useToast()
  const { t } = useI18n()

  const showToast = (type: 'success' | 'error', messageKey: string) => {
    toast.add({
      severity: type,
      summary: t(type === 'success' ? 'general.success' : 'general.error'),
      detail: t(messageKey),
      life: 3000,
    })
  }

  const handleError = (error: unknown, messageKey: string) => {
    showToast('error', messageKey)
  }

  const generateFileName = (prefix: string) => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const month = monthNames[now.getMonth()]
    const year = now.getFullYear()
    let hours = now.getHours()
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12

    return `${prefix}_${day}${month}${year}_${hours}.${minutes}${ampm}.xlsx`
  }


  //Auditoría 🔍
  const getAudits = async (query?: IFilterAudit) => {
    try {
      return await privateApi.get<IPaginationResponse<IAudit>>('/audit', { params: { ...query } })
    } catch (error) {
      handleError(error, 'report.error_getting_audit')
      return null
    }
  }

  const exportAudits = async (query?: IFilterAudit) => {
    try {
      const response: Blob = await privateApi.get('/audit/export', {
        responseType: 'blob',
        params: { ...query },
      })

      if (!response) throw new Error('No response data received')

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', generateFileName('audit_report'))
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast('success', 'report.audit_success_exported')
    } catch (error) {
      handleError(error, 'report.audit_error_exported')
    }
  }

  //Mensajes ✉️
  const getMessages = async (query?: IFilterMessage) => {
    try {
      const filteredQuery = Object.fromEntries(
        Object.entries(query || {}).filter(([_, v]) => v != null && v !== '')
      )
      return await privateApi.get<IPaginationResponse<IMessage>>('/messages', {
        params: filteredQuery,
      })
    } catch (error) {
      handleError(error, 'report.error_getting_messages')
      return null
    }
  }

  const exportMessages = async (query?: IFilterMessage) => {
    try {
      const filteredQuery = Object.fromEntries(
        Object.entries(query || {}).filter(([_, v]) => v != null && v !== '')
      )
      const response: Blob = await privateApi.get('/messages/export', {
        responseType: 'blob',
        params: filteredQuery,
      })

      if (!response) throw new Error('No response data received')

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', generateFileName('messages_report'))
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast('success', 'report.messages_success_exported')
    } catch (error) {
      handleError(error, 'report.error_exporting_messages')
    }
  }

  return {
    getAudits,
    exportAudits,
    getMessages,
    exportMessages,
  }
}
