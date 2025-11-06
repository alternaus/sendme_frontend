export interface IOrganizationFormData {
  name: string
  document: string
  documentType: string
  email: string
  phone: string
  country: string
  city: string
  address?: string
}

export interface IManagerFormData {
  name: string
  email: string
  password: string
}

export interface ICustomPlanFormData {
  planName: string
  subscriptionPrice: number
  includedMessages: number
  messagePrice: number
  resetDay: number
  campaignLimit?: number
  contactLimit?: number
  tagLimit?: number
  customFieldLimit?: number
}

export interface ICreateClientWithExistingPlanDto {
  organization: IOrganizationFormData
  managers: IManagerFormData[]
}

export interface ICreateClientWithCustomPlanDto {
  organization: IOrganizationFormData
  customPlan: ICustomPlanFormData
  managers: IManagerFormData[]
}
