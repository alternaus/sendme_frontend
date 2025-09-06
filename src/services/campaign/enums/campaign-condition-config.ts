import { CampaignConditionType } from './campaign-condition-type.enum'
import { CustomFieldDataType } from './custom-field-data-type.enum'

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

export const BETWEEN_INPUT_CONDITIONS = [
  CampaignConditionType.BETWEEN,
  CampaignConditionType.BETWEEN_DATES,
] as const

