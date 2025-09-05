// Campaign status types for UI display
export enum CampaignStatusTypes {
  ACTIVE = 'general.active',
  INACTIVE = 'general.inactive',
  PAUSED = 'general.paused',
  FINISHED = 'general.finished',
}

// Campaign status for API communication
export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

// Campaign content types
export enum CampaignContentType {
  PLAIN_TEXT = 'PLAIN_TEXT',
  HTML = 'HTML',
}

// Campaign frequency types
export enum CampaignFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

// Campaign rule condition types
export enum CampaignConditionType {
  // Empty/Not Empty conditions
  IS_EMPTY = 'IS_EMPTY',
  NOT_EMPTY = 'NOT_EMPTY',

  // Equality conditions
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',

  // String conditions
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',

  // Numeric conditions
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_OR_EQUAL = 'GREATER_OR_EQUAL',
  LESS_OR_EQUAL = 'LESS_OR_EQUAL',
  BETWEEN = 'BETWEEN',

  // Date conditions
  BETWEEN_DATES = 'BETWEEN_DATES',
  BIRTHDAY_TODAY = 'BIRTHDAY_TODAY',
  BIRTHDAY_IN_X_DAYS = 'BIRTHDAY_IN_X_DAYS',
  IS_TODAY = 'IS_TODAY',
  WAS_YESTERDAY = 'WAS_YESTERDAY',
  IS_TOMORROW = 'IS_TOMORROW',
  IN_X_DAYS = 'IN_X_DAYS',
}

// Custom field data types
export enum CustomFieldDataType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
}

// Condition groups by data type
export const CONDITIONS_BY_DATA_TYPE = {
  [CustomFieldDataType.STRING]: [
    CampaignConditionType.IS_EMPTY,
    CampaignConditionType.NOT_EMPTY,
    CampaignConditionType.EQUALS,
    CampaignConditionType.NOT_EQUALS,
    CampaignConditionType.CONTAINS,
    CampaignConditionType.STARTS_WITH,
    CampaignConditionType.ENDS_WITH,
  ],
  [CustomFieldDataType.NUMBER]: [
    CampaignConditionType.IS_EMPTY,
    CampaignConditionType.NOT_EMPTY,
    CampaignConditionType.EQUALS,
    CampaignConditionType.NOT_EQUALS,
    CampaignConditionType.GREATER_THAN,
    CampaignConditionType.LESS_THAN,
    CampaignConditionType.GREATER_OR_EQUAL,
    CampaignConditionType.LESS_OR_EQUAL,
    CampaignConditionType.BETWEEN,
  ],
  [CustomFieldDataType.BOOLEAN]: [
    CampaignConditionType.EQUALS,
    CampaignConditionType.NOT_EQUALS,
  ],
  [CustomFieldDataType.DATE]: [
    CampaignConditionType.IS_EMPTY,
    CampaignConditionType.NOT_EMPTY,
    CampaignConditionType.EQUALS,
    CampaignConditionType.NOT_EQUALS,
    CampaignConditionType.GREATER_THAN,
    CampaignConditionType.LESS_THAN,
    CampaignConditionType.GREATER_OR_EQUAL,
    CampaignConditionType.LESS_OR_EQUAL,
    CampaignConditionType.BETWEEN_DATES,
    CampaignConditionType.BIRTHDAY_TODAY,
    CampaignConditionType.BIRTHDAY_IN_X_DAYS,
    CampaignConditionType.IS_TODAY,
    CampaignConditionType.WAS_YESTERDAY,
    CampaignConditionType.IS_TOMORROW,
    CampaignConditionType.IN_X_DAYS,
  ],
} as const

// Conditions that don't require value input
export const CONDITIONS_WITHOUT_VALUE = [
  CampaignConditionType.IS_EMPTY,
  CampaignConditionType.NOT_EMPTY,
  CampaignConditionType.BIRTHDAY_TODAY,
  CampaignConditionType.IS_TODAY,
  CampaignConditionType.WAS_YESTERDAY,
  CampaignConditionType.IS_TOMORROW,
] as const

// Conditions that require numeric input
export const NUMERIC_INPUT_CONDITIONS = [
  CampaignConditionType.BIRTHDAY_IN_X_DAYS,
  CampaignConditionType.IN_X_DAYS,
] as const

// Conditions that require date input
export const DATE_INPUT_CONDITIONS = [
  CampaignConditionType.EQUALS,
  CampaignConditionType.NOT_EQUALS,
  CampaignConditionType.GREATER_THAN,
  CampaignConditionType.LESS_THAN,
  CampaignConditionType.GREATER_OR_EQUAL,
  CampaignConditionType.LESS_OR_EQUAL,
] as const

// Conditions that require between input (two values)
export const BETWEEN_INPUT_CONDITIONS = [
  CampaignConditionType.BETWEEN,
  CampaignConditionType.BETWEEN_DATES,
] as const

// Campaign validation limits
export const CAMPAIGN_LIMITS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  CONTENT_MAX_LENGTH: 4000,
  MAX_RULES_PER_CAMPAIGN: 10,
} as const

// Type mappings for conversion between UI and API enums
export const STATUS_TYPE_MAPPING = {
  [CampaignStatusTypes.ACTIVE]: CampaignStatus.ACTIVE,
  [CampaignStatusTypes.INACTIVE]: CampaignStatus.INACTIVE,
  [CampaignStatusTypes.PAUSED]: CampaignStatus.PAUSED,
  [CampaignStatusTypes.FINISHED]: CampaignStatus.FINISHED,
} as const

// Type definitions
export type CampaignStatusType = keyof typeof CampaignStatus
export type CampaignConditionTypeKey = keyof typeof CampaignConditionType
export type CustomFieldDataTypeKey = keyof typeof CustomFieldDataType
