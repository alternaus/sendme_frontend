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
}

export interface IUpdateCustomValue {
  customFieldId:string
  value: string | null // Permitir null para campos de fecha
}
