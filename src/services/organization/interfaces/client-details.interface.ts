import type { IOrganization } from './organization.interface'

export interface IClientPlanDetails {
  id: string
  planName: string
  subscriptionPrice: number
  messagePrice: number
  includedMessages: number
  resetDay: number
  campaignLimit: number
  contactLimit: number
  tagLimit: number
  customFieldLimit: number
}

export interface IClientManager {
  name: string
  email: string
}

export interface IClientDetailsResponse {
  organization: IOrganization
  plan: IClientPlanDetails
  managers?: IClientManager[]
}
