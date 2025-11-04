import { type Ref, ref } from 'vue'

import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import type { CampaignRule } from '@/pages/campaigns/composables/useCampaignForm'
import {
  BETWEEN_INPUT_CONDITIONS,
  CONDITIONS_BY_DATA_TYPE,
  CONDITIONS_WITHOUT_VALUE,
  DATE_INPUT_CONDITIONS,
  NUMERIC_INPUT_CONDITIONS} from '@/services/campaign/enums/campaign-condition-config'
import { CampaignConditionType } from '@/services/campaign/enums/campaign-condition-type.enum'
import { CustomFieldDataType } from '@/services/campaign/enums/custom-field-data-type.enum'
import type { ICustomField } from '@/services/custom-field/interfaces/custom-field.interface'

type DataTypeKey = keyof typeof CONDITIONS_BY_DATA_TYPE

export const useCampaignTriggerInputs =(
  campaignRulesRef: Ref<CampaignRule[]>,
  customFieldsDataRef: Ref<ICustomField[]>,
  conditionOptionsRef: Ref<SelectOption[]>,
) =>{
  const betweenValues = ref<Record<number, { min: string; max: string }>>({})

  const getConditionsForDataType = (dataType: DataTypeKey): CampaignConditionType[] => {
    const conditions = CONDITIONS_BY_DATA_TYPE[dataType]
    return conditions ? [...conditions] : []
  }

  const getFilteredConditionOptionsForField = (customFieldId: string): SelectOption[] => {
    const customField = customFieldsDataRef.value.find(
      (field: ICustomField) => field.id === customFieldId,
    )

    if (!customField) {
      return conditionOptionsRef.value
    }

    const availableConditions = getConditionsForDataType(customField.dataType as DataTypeKey)
    return conditionOptionsRef.value.filter(option =>
      availableConditions.includes(option.value as CampaignConditionType)
    )
  }

  const needsValueInput = (conditionType: string | null) => {
    if (!conditionType) return false
    return !(CONDITIONS_WITHOUT_VALUE as readonly string[]).includes(conditionType)
  }

  const isNumericInput = (conditionType: string | null, customFieldId?: string) => {
    if (!conditionType) return false
    if ((NUMERIC_INPUT_CONDITIONS as readonly string[]).includes(conditionType)) {
      return true
    }
    if (customFieldId) {
      const customField = customFieldsDataRef.value.find(
        (field: ICustomField) => field.id === customFieldId,
      )
      if (customField?.dataType === CustomFieldDataType.NUMBER &&
          (DATE_INPUT_CONDITIONS as readonly string[]).includes(conditionType)) {
        return true
      }
    }

    return false
  }

  const isDateInput = (conditionType: string | null, customFieldId?: string) => {
    if (!conditionType) return false
    if (customFieldId) {
      const customField = customFieldsDataRef.value.find(
        (field: ICustomField) => field.id === customFieldId,
      )
      if (customField?.dataType === CustomFieldDataType.DATE &&
          (DATE_INPUT_CONDITIONS as readonly string[]).includes(conditionType)) {
        return true
      }
    }

    return false
  }

  const isBetweenInput = (conditionType: string | null) => {
    if (!conditionType) return false
    return (BETWEEN_INPUT_CONDITIONS as readonly string[]).includes(conditionType)
  }

  const isDateBetweenInput = (conditionType: string | null) => {
    if (!conditionType) return false
    return conditionType === CampaignConditionType.BETWEEN_DATES
  }



  const updateBetweenValue = (index: number, type: 'min' | 'max', value: string) => {
    if (!betweenValues.value[index]) {
      betweenValues.value[index] = { min: '', max: '' }
    }

    betweenValues.value[index][type] = value

    const rule = campaignRulesRef.value[index]
    if (rule) {
      const { min, max } = betweenValues.value[index]
      rule.value = `${min},${max}`
    }
  }

  const getBetweenValue = (index: number, type: 'min' | 'max'): string => {
    return betweenValues.value[index]?.[type] || ''
  }

  const initializeBetweenValues = () => {
    const newBetweenValues: Record<number, { min: string; max: string }> = {}

    campaignRulesRef.value.forEach((rule: CampaignRule, index: number) => {
      if (!betweenValues.value[index]) {
        if (rule.value && rule.value.includes(',')) {
          const [min, max] = rule.value.split(',')
          newBetweenValues[index] = { min: min.trim(), max: max.trim() }
        } else {
          newBetweenValues[index] = { min: '', max: '' }
        }
      } else {
        newBetweenValues[index] = betweenValues.value[index]
      }
    })

    betweenValues.value = newBetweenValues
  }

  const clearBetweenValues = (index: number) => {
    betweenValues.value[index] = { min: '', max: '' }
  }

  const updateBetweenValuesAfterRemove = (removedIndex: number) => {
    const newBetweenValues: Record<number, { min: string; max: string }> = {}
    Object.entries(betweenValues.value).forEach(([key, value]) => {
      const numKey = Number(key)
      if (numKey < removedIndex) {
        newBetweenValues[numKey] = value
      } else if (numKey > removedIndex) {
        newBetweenValues[numKey - 1] = value
      }
    })
    betweenValues.value = newBetweenValues
  }

  return {
    betweenValues,
    getConditionsForDataType,
    getFilteredConditionOptions: getFilteredConditionOptionsForField,
    needsValueInput,
    isNumericInput,
    isDateInput,
    isBetweenInput,
    isDateBetweenInput,
    updateBetweenValue,
    getBetweenValue,
    initializeBetweenValues,
    clearBetweenValues,
    updateBetweenValuesAfterRemove,
  }
}
