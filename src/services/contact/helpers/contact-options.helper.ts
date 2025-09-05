import { ContactOriginTypes, ContactStatusTypes, COUNTRY_CODES } from '../constants/contact.constants'

export interface SelectOption {
  name: string
  value: string
}

export const createContactOriginOptions = (t: (key: string) => string): SelectOption[] =>
  Object.entries(ContactOriginTypes).map(([key, value]) => ({
    name: t(value),
    value: key.toLowerCase(),
  }))

export const createContactStatusOptions = (t: (key: string) => string): SelectOption[] =>
  Object.entries(ContactStatusTypes).map(([key, value]) => ({
    name: t(value),
    value: key,
  }))

export const createCountryCodeOptions = (): SelectOption[] =>
  COUNTRY_CODES.map(country => ({
    name: country.name,
    value: country.value,
  }))

export const getStatusTranslationKey = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return ContactStatusTypes.ACTIVE
    case 'INACTIVE':
      return ContactStatusTypes.INACTIVE
    case 'BLOCKED':
      return ContactStatusTypes.BLOCKED
    default:
      return ContactStatusTypes.INACTIVE
  }
}

export const getOriginTranslationKey = (origin: string): string => {
  switch (origin.toUpperCase()) {
    case 'API':
      return ContactOriginTypes.API
    case 'EXCEL':
      return ContactOriginTypes.EXCEL
    case 'GOOGLE':
      return ContactOriginTypes.GOOGLE
    default:
      return ContactOriginTypes.API
  }
}
