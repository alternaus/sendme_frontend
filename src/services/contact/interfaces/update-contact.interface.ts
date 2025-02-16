import type { ContactStatus } from '../enums/contact-status.enum'

export interface IUpdateContact {
  name?: string
  email?: string
  phone?: string
  countryCode?: string
  status?: ContactStatus
  lastName?: string
  birthDate?: Date
  customValues?: IUpdateCustomValue[]
}

export interface IUpdateCustomValue {
  customFieldId: number
  value: string
}
