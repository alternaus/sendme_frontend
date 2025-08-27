export interface IRole {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface IUser {
  id: number
  roleId: number
  avatarUrl: string
  organizationId: number
  name: string
  email: string
  role: IRole
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
