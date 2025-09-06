import type { ContactStatus } from '../enums/contact-status.enum'

export interface IContact {
  id:string
  name?: string
  email?: string
  phone: string
  countryCode: string
  status?: ContactStatus
  lastName?: string
  birthDate?: Date | null
  customValues?: ICustomValue[]
  organizationId:string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ICustomValue {
  id:string
  value: string | null // Permitir null para campos de fecha
  contactId:string
  customFieldId:string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
