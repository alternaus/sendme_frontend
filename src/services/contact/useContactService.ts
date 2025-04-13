import { useApiClient } from '@/composables/useApiClient'

import type { IPaginationResponse } from '../interfaces/pagination-response.interface'
import type { IContact } from './interfaces/contact.interface'
import type { ICreateContact } from './interfaces/create-contact.interface'
import type { IFilterContact } from './interfaces/filter-contact.interface'
import type { IUpdateContact } from './interfaces/update-contact.interface'

export const useContactService = () => {
  const privateApi = useApiClient(true)

  const getContacts = async (query?: IFilterContact) => {
    return privateApi.get<IPaginationResponse<IContact>>('/contacts', {
      params: { ...query },
    })
  }

  const getContactCount = async (): Promise<{ total: number }> => {
    return privateApi.get<{ total: number }>('/contacts/count')
  }

  const getContact = async (id: string) => {
    return privateApi.get<IContact>(`/contacts/${id}`)
  }

  const createContact = async (contact: ICreateContact) => {
    return privateApi.post<IContact, ICreateContact>('/contacts', contact)
  }

  const updateContact = async (id: string, contact: IUpdateContact) => {
    return privateApi.patch<IUpdateContact>(`/contacts/${id}`, contact)
  }

  const deleteContact = async (id: number) => {
    return privateApi.delete(`/contacts/${id}`)
  }

  const exportContacts = async (query?: IFilterContact) => {
    const response: Blob = await privateApi.get('/contacts/export', {
      responseType: 'blob',
      params: { ...query },
    })

    if (!response) {
      console.error('No response data received')
      return
    }

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'contacts.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getImportPreview = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return privateApi.post('/contacts/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  const importContacts = async (file: File, fieldMapping: Record<string, string>) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fieldMapping', JSON.stringify(fieldMapping))
    return privateApi.post<{ jobId: string }>('/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  const getImportStatus = async (jobId: string) => {
    return privateApi.get<{
      status: 'processing' | 'completed' | 'error'
      progress: number
      total: number
      errors?: string[]
    }>(`/contacts/import/${jobId}/status`)
  }

  return {
    getContacts,
    getContact,
    getContactCount,
    createContact,
    updateContact,
    deleteContact,
    exportContacts,
    getImportPreview,
    importContacts,
    getImportStatus,
  }
}
