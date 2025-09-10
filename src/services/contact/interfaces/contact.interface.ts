import type { ITag } from '../../tag/interfaces'
import type { ContactOrigin } from '../enums/contact-origin.enum'
import type { ContactStatus } from '../enums/contact-status.enum'

export interface IContact {
  id:string
  name?: string
  email?: string
  phone: string
  countryCode: string
  origin?: ContactOrigin
  status?: ContactStatus
  lastName?: string
  birthDate?: Date | null
  customValues?: ICustomValue[]
  tags?: ITag[]
  organizationId:string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ICustomValue {
  id:string
  value: string | null
  contactId:string
  customFieldId:string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}
