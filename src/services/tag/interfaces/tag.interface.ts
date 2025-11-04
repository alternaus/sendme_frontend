export interface ITag {
  id: string
  name: string
  description?: string
  color?: string
  organizationId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface ITagWithCounts extends ITag {
  contactCount: number
  campaignCount: number
}
