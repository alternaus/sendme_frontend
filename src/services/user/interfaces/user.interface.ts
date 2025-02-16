export interface IUser {
  id: number
  roleId: number
  organizationId: number
  name: string
  email: string
  role: IRole
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

export interface IRole {
  id: number
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}
