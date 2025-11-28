export interface IRole {
  id:string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface IPlanLimits {
  planName: string
  contactLimit: number
  campaignLimit: number
  tagLimit: number
  customFieldLimit: number
}

export interface IUser {
  id:string
  roleId:string
  avatarUrl: string
  organizationId:string
  name: string
  email: string
  role: IRole
  planLimits: IPlanLimits
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
