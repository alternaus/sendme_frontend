import type { ContactStatus } from '../enums/contact-status.enum'

export interface ICreateContact {
  name: string
  email: string
  phone: string
  countryCode: string
  status: ContactStatus
  lastName: string
  birthDate: Date
  customValues: ICreateCustomValue[]
}

export interface ICreateCustomValue {
  customFieldId: number
  value: string
}
