import { useApiClient } from '@/composables/useApiClient'
import type { IPaginationResponse } from '@/services/interfaces/pagination-response.interface'

import type { ICreateUser } from './interfaces/create-user.interface'
import type { IFilterUser } from './interfaces/filter-user.interface'
import type { IUpdateUser } from './interfaces/update-user.interface'
import type { IUser } from './interfaces/user.interface'

export const useUserService = () => {
  const privateApi = useApiClient(true)

  const getUsers = async (filters: IFilterUser = {}) => {
    return privateApi.get<IPaginationResponse<IUser>>('/users', { params: filters })
  }

  const getUserCount = async () => {
    return privateApi.get<number>('/users/count')
  }

  const getUser = async (id:string) => {
    return privateApi.get<IUser>(`/users/${id}`)
  }

  const createUser = async (user: ICreateUser) => {
    return privateApi.post<IUser, ICreateUser>('/users', user)
  }

  const updateUser = async (id:string, user: IUpdateUser) => {
    return privateApi.patch<IUser, IUpdateUser>(`/users/${id}`, user)
  }

  const deleteUser = async (id:string) => {
    return privateApi.delete<IUser>(`/users/${id}`)
  }

  const exportUsers = async () => {
    return privateApi.get('/users/export', { responseType: 'blob' })
  }

  return {
    getUsers,
    getUserCount,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    exportUsers
  }
}
