import type { ContactStatus } from '../enums/contact-status.enum'

export interface ICreateContact {
  name?: string
  email?: string
  phone: string
  countryCode: string
  status?: ContactStatus
  lastName?: string
  birthDate?: Date | null
  customValues?: ICreateCustomValue[]
  tagIds?: string[]
}

export interface ICreateCustomValue {
  customFieldId:string
  value: string | null
}
