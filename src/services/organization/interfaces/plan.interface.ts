export interface IPlan {
  id: string
  name: string
  description: string
  contactLimit: number
  campaignLimit: number
  tagLimit: number
  customFieldLimit: number
  cost: number
  pricePerMessage: number
  currency: string
  public: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: null
}
