import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import { useApiClient } from '@/composables/useApiClient'
import type { IAudit } from '@/services/report/interfaces/audit.interface'
import type { IFilterAudit } from '@/services/report/interfaces/filter-audit.interface'
import type { IFilterMessage } from '@/services/report/interfaces/filter-message.interface'
import type { IMessage } from '@/services/report/interfaces/message.interface'

export const useReportService = () => {
  const privateApi = useApiClient(true)
  const toast = useToast()
  const { t } = useI18n()

  const handleError = (error: unknown, messageKey: string) => {
    console.error(`❌ ${t(messageKey)}:`, error)
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t(messageKey),
      life: 3000,
    })
  }

  // Auditoria 🔍
  const getAudits = async (query?: IFilterAudit) => {
    try {
      return await privateApi.get<IAudit[]>('/audit', { params: { ...query } })
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

      if (!response) {
        console.error('❌ No response data received')
        return
      }

      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', 'audit_report.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      handleError(error, 'report.error_exporting_audit')
    }
  }

  // Mensajes ✉️
  const getMessages = async (query?: IFilterMessage) => {
    try {
      return await privateApi.get<IMessage[]>('/messages', { params: { ...query } })
    } catch (error) {
      handleError(error, 'report.error_getting_messages')
      return null
    }
  }

  return {
    getAudits,
    exportAudits,
    getMessages,
  }
}
