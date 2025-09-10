import type { ContactStatus } from '../enums/contact-status.enum'

export interface IUpdateContact {
  name?: string
  email?: string
  phone?: string
  countryCode?: string
  status?: ContactStatus
  lastName?: string
  birthDate?: Date | null
  customValues?: IUpdateCustomValue[]
  tagIds?: string[]
}

export interface IUpdateCustomValue {
  customFieldId:string
  value: string | null
}
