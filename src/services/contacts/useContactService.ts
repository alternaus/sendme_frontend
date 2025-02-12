import { useApiClient } from '@/composables/useApiClient'

import type { IContact } from './interfaces/contact.interface'

export const useContactService = () => {
  const privateApi = useApiClient(true)

  const getContacts = async () => {
    return privateApi.get<IContact[]>('/contacts')
  }

  return {
    getContacts,
  }
}
