import { useApiClient } from '@/composables/useApiClient'

import type { IRole } from './interfaces/role.interface'

export const useRoleService = () => {
  const privateApi = useApiClient(true)

  const listRoles = async () => {
    return privateApi.get<IRole[]>('/roles')
  }

  return {
    listRoles
  }
}
