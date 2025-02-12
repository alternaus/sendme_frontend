import { useApiClient } from '@/composables/useApiClient'

import type { ICustomField } from './interfaces/custom-field.interface'

export const useCustomFieldService = () => {
  const privateApi = useApiClient(true)

  const getCustomFields = async () => {
    return privateApi.get<ICustomField[]>('/custom-fields')
  }

  return {
    getCustomFields,
  }
}
