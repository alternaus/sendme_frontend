import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import type { ICustomField } from '@/services/custom-field/interfaces/custom-field.interface'

import {
  BETWEEN_INPUT_CONDITIONS,
  CampaignContentType,
  CampaignFrequency,
  CampaignStatusTypes,
  CONDITIONS_BY_DATA_TYPE,
  CONDITIONS_WITHOUT_VALUE,
  CustomFieldDataType,
  DATE_INPUT_CONDITIONS,
  NUMERIC_INPUT_CONDITIONS,
} from '../constants/campaign.constants'

export interface CampaignStatusOption {
  name: string
  value: string
}

export interface CampaignFrequencyOption {
  name: string
  value: CampaignFrequency
}

export interface CampaignContentTypeOption {
  name: string
  value: CampaignContentType
}

export const createCampaignStatusOptions = (t: (key: string) => string): CampaignStatusOption[] =>
  Object.entries(CampaignStatusTypes).map(([key, value]) => ({
    name: t(value),
    value: key,
  }))

export const createCampaignFrequencyOptions = (t: (key: string) => string): CampaignFrequencyOption[] => [
  { name: t('campaign.frequency.daily'), value: CampaignFrequency.DAILY },
  { name: t('campaign.frequency.weekly'), value: CampaignFrequency.WEEKLY },
  { name: t('campaign.frequency.monthly'), value: CampaignFrequency.MONTHLY },
]

export const createCampaignContentTypeOptions = (t: (key: string) => string): CampaignContentTypeOption[] => [
  { name: t('campaign.content.plain_text'), value: CampaignContentType.PLAIN_TEXT },
  { name: t('campaign.content.html'), value: CampaignContentType.HTML },
]

// Get conditions available for a specific data type
export const getConditionsForDataType = (dataType: string): readonly string[] => {
  const normalizedDataType = dataType as CustomFieldDataType
  return CONDITIONS_BY_DATA_TYPE[normalizedDataType] || []
}

// Get filtered condition options for a custom field
export const getFilteredConditionOptions = (
  customFieldId: number,
  customFields: ICustomField[],
  conditionOptions: SelectOption[]
): SelectOption[] => {
  if (!customFieldId) return []

  const customField = customFields.find((field: ICustomField) => field.id === customFieldId)
  if (!customField) return conditionOptions

  const allowedConditions = getConditionsForDataType(customField.dataType)
  return conditionOptions.filter((option: SelectOption) =>
    allowedConditions.includes(option.value as string)
  )
}

// Check if condition requires value input
export const conditionRequiresValue = (conditionType: string): boolean => {
  return !(CONDITIONS_WITHOUT_VALUE as readonly string[]).includes(conditionType)
}

// Check if condition requires numeric input
export const conditionRequiresNumericInput = (conditionType: string): boolean => {
  return (NUMERIC_INPUT_CONDITIONS as readonly string[]).includes(conditionType)
}

// Check if condition requires date input
export const conditionRequiresDateInput = (conditionType: string): boolean => {
  return (DATE_INPUT_CONDITIONS as readonly string[]).includes(conditionType)
}

// Check if condition requires between input (two values)
export const conditionRequiresBetweenInput = (conditionType: string): boolean => {
  return (BETWEEN_INPUT_CONDITIONS as readonly string[]).includes(conditionType)
}

// Get status translation key
export const getStatusTranslationKey = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return CampaignStatusTypes.ACTIVE
    case 'INACTIVE':
      return CampaignStatusTypes.INACTIVE
    case 'PAUSED':
      return CampaignStatusTypes.PAUSED
    case 'FINISHED':
      return CampaignStatusTypes.FINISHED
    default:
      return CampaignStatusTypes.INACTIVE
  }
}

// Days of the week options
export const createDaysOfWeekOptions = (t: (key: string) => string): SelectOption[] => [
  { name: t('general.days.monday'), value: 'monday' },
  { name: t('general.days.tuesday'), value: 'tuesday' },
  { name: t('general.days.wednesday'), value: 'wednesday' },
  { name: t('general.days.thursday'), value: 'thursday' },
  { name: t('general.days.friday'), value: 'friday' },
  { name: t('general.days.saturday'), value: 'saturday' },
  { name: t('general.days.sunday'), value: 'sunday' },
]
