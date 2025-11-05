import { useApiClient } from '@/composables/useApiClient'
import { downloadFile, EXCEL_MIME_TYPE, generateFileName } from '@/utils/download.helper'

import type { IPaginationResponse } from '../interfaces/pagination-response.interface'
import type { IAudit } from './interfaces/audit.interface'
import type { ICampaignDispatch } from './interfaces/dispatch.interface'
import type { IFilterAudit } from './interfaces/filter-audit.interface'
import type { ICampaignDispatchFilter } from './interfaces/filter-dispatch.interface'
import type { IFilterMessage } from './interfaces/filter-message.interface'
import type { IMessage } from './interfaces/message.interface'

export const useReportService = () => {
  const privateApi = useApiClient(true)

  const listAudits = async (query?: IFilterAudit) => {
    return privateApi.get<IPaginationResponse<IAudit>>('/audit', { params: query })
  }

  const exportAudits = async (query?: IFilterAudit) => {
    const response: Blob = await privateApi.get('/audit/export', {
      responseType: 'blob',
      params: query,
    })

    downloadFile(response, generateFileName('audit_report'), EXCEL_MIME_TYPE)
  }

  const listMessages = async (query?: IFilterMessage) => {
    return privateApi.get<IPaginationResponse<IMessage>>('/messages', {
      params: query,
    })
  }

  const exportMessages = async (query?: IFilterMessage) => {
    const response: Blob = await privateApi.get('/messages/export', {
      responseType: 'blob',
      params: query,
    })

    downloadFile(response, generateFileName('messages_report'), EXCEL_MIME_TYPE)
  }

  const listDispatches = async (query?: ICampaignDispatchFilter) => {
    return privateApi.get<IPaginationResponse<ICampaignDispatch>>('/campaign-dispatches', {
      params: query,
    })
  }

  const exportDispatches = async (query?: ICampaignDispatchFilter) => {
    const response: Blob = await privateApi.get('/campaign-dispatches/export', {
      responseType: 'blob',
      params: query,
    })

    downloadFile(response, generateFileName('dispatches_report'), EXCEL_MIME_TYPE)
  }

  return {
    listAudits,
    exportAudits,
    listMessages,
    exportMessages,
    listDispatches,
    exportDispatches,
  }
}
