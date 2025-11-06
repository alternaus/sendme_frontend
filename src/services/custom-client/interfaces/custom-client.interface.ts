export interface ISubscription {
  status: 'active' | 'suspended' | 'cancelled'
  startDate: string
  nextBillingDate: string
  cancelledAt?: string
}

export interface IRecharge {
  currentMessages: number
  lastResetDate: string
  nextResetDate: string
}

export interface IManager {
  name: string
  email: string
}

export interface ICustomClientPlan {
  name: string
  subscriptionPrice: number
  includedMessages: number
  messagePrice: number
  resetDay: number
  campaignLimit: number
  contactLimit: number
  tagLimit: number
  customFieldLimit: number
}

export interface ICustomClient {
  _id: string
  name: string
  document: string
  documentType: string
  email: string
  phone: string
  country: string
  city: string
  address?: string
  plan: ICustomClientPlan
  subscription: ISubscription
  recharge: IRecharge
  managers: IManager[]
  createdAt: string
  updatedAt: string
}
