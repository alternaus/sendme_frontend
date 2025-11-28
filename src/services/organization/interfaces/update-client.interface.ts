import type { ICustomPlanFormData, IOrganizationFormData } from './create-client.interface'

export interface IUpdateClientDto {
  organization?: Partial<IOrganizationFormData>
  plan?: Partial<ICustomPlanFormData>
  planId?: string
}
