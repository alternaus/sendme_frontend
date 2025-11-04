export interface IRole {
  id:string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface IUser {
  id:string
  roleId:string
  avatarUrl: string
  organizationId:string
  name: string
  email: string
  role: IRole
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
