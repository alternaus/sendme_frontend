import { useApiClient } from '@/composables/useApiClient'

import type { ICreateCustomField } from './interfaces/create-custom-field.interface'
import type { ICustomField } from './interfaces/custom-field.interface'

export const useCustomFieldService = () => {
  const privateApi = useApiClient(true)

  const getCustomFields = async () => {
    return privateApi.get<ICustomField[]>('/custom-fields')
  }

  const createCustomField = async (customField: ICreateCustomField) => {
    return privateApi.post<ICustomField, ICreateCustomField>('/custom-fields', customField)
  }

  const updateCustomField = async (id:string, customField: Partial<ICreateCustomField>) => {
    return privateApi.patch<ICustomField, Partial<ICreateCustomField>>(`/custom-fields/${id}`, customField)
  }

  const deleteCustomField = async (id:string) => {
    return privateApi.delete<ICustomField>(`/custom-fields/${id}`)
  }

  return {
    getCustomFields,
    createCustomField,
    updateCustomField,
    deleteCustomField
  }
}


