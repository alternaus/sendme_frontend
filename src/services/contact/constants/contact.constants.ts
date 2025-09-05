// Contact origin types for UI display
export enum ContactOriginTypes {
  API = 'general.api',
  EXCEL = 'general.excel',
  GOOGLE = 'general.google',
}

// Contact status types for UI display
export enum ContactStatusTypes {
  ACTIVE = 'general.active',
  INACTIVE = 'general.inactive',
  BLOCKED = 'general.blocked',
}

// Contact status for API communication
export enum ContactStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

// Contact origin values for API communication
export enum ContactOrigin {
  API = 'API',
  EXCEL = 'EXCEL',
  GOOGLE = 'GOOGLE',
}

// Country codes for contact filtering
export const COUNTRY_CODES = [
  { name: 'Colombia (+57)', value: 'CO' },
  { name: 'Estados Unidos (+1)', value: 'US' },
  { name: 'México (+52)', value: 'MX' },
  { name: 'España (+34)', value: 'ES' },
  { name: 'Argentina (+54)', value: 'AR' },
] as const

// Contact validation constants
export const CONTACT_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MIN_LENGTH: 7,
  PHONE_MAX_LENGTH: 15,
} as const

// Type mappings for conversion between UI and API enums
export const STATUS_TYPE_MAPPING = {
  [ContactStatusTypes.ACTIVE]: ContactStatus.ACTIVE,
  [ContactStatusTypes.INACTIVE]: ContactStatus.INACTIVE,
  [ContactStatusTypes.BLOCKED]: ContactStatus.BLOCKED,
} as const

export const ORIGIN_TYPE_MAPPING = {
  [ContactOriginTypes.API]: ContactOrigin.API,
  [ContactOriginTypes.EXCEL]: ContactOrigin.EXCEL,
  [ContactOriginTypes.GOOGLE]: ContactOrigin.GOOGLE,
} as const

// Type definitions
export type ContactOriginType = keyof typeof ContactOrigin
export type ContactStatusType = keyof typeof ContactStatus
