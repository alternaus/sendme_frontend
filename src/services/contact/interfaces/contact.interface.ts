import type { ContactStatus } from '../enums/contact-status.enum'

export interface IContact {
  id: number
  name: string
  email: string
  phone: string
  countryCode: string
  status: ContactStatus
  lastName: string
  birthDate: Date
  customValues: ICustomValue[]
  organizationId: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}

export interface ICustomValue {
  id: number
  value: string
  contactId: number
  customFieldId: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
}
