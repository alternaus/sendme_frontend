import type { IPlan } from '@/services/organization/interfaces/plan.interface'

export interface IClientResponseOrganization {
  id: string
  name: string
  document: string
  documentType: string
  email: string
  phone: string
  country: string
  city: string
  address?: string
}

export interface IClientResponseSubscription {
  id: string
  status: string
  nextResetDate: string
}

export interface IClientResponsePayment {
  id: string
  amount: number
  status: string
}

export interface IClientResponseRecharge {
  id: string
  messageCount: number
  remainingMessages: number
}

export interface IClientResponseManager {
  id: string
  name: string
  email: string
}

export interface ICreateClientResponse {
  organization: IClientResponseOrganization
  plan: IPlan
  subscription: IClientResponseSubscription
  payment: IClientResponsePayment
  recharge: IClientResponseRecharge
  users: IClientResponseManager[]
}
