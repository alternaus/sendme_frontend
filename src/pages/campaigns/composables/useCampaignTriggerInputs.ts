import { type Ref,ref } from 'vue'

import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import type { CampaignRule } from '@/pages/campaigns/composables/useCampaignForm'
import type { ICustomField } from '@/services/custom-field/interfaces/custom-field.interface'

export function useCampaignTriggerInputs(
  campaignRulesRef: Ref<CampaignRule[]>,
  customFieldsDataRef: Ref<ICustomField[]>,
  conditionOptionsRef: Ref<SelectOption[]>
) {
  //Variables para manejar los valores de "between" por separado
  const betweenValues = ref<Record<number, { min: string; max: string }>>({})

  //Definir qué condiciones son aplicables para cada tipo de dato
  const getConditionsForDataType = (dataType: string): string[] => {
    switch (dataType) {
      case 'string':
        return [
          'IS_EMPTY',
          'NOT_EMPTY',
          'EQUALS',
          'NOT_EQUALS',
          'CONTAINS',
          'STARTS_WITH',
          'ENDS_WITH'
        ]
      case 'number':
        return [
          'IS_EMPTY',
          'NOT_EMPTY',
          'EQUALS',
          'NOT_EQUALS',
          'GREATER_THAN',
          'LESS_THAN',
          'GREATER_OR_EQUAL',
          'LESS_OR_EQUAL',
          'BETWEEN'
        ]
      case 'boolean':
        return [
          'EQUALS',
          'NOT_EQUALS'
        ]
      case 'date':
        return [
          'IS_EMPTY',
          'NOT_EMPTY',
          'EQUALS',
          'NOT_EQUALS',
          'GREATER_THAN',
          'LESS_THAN',
          'GREATER_OR_EQUAL',
          'LESS_OR_EQUAL',
          'BETWEEN_DATES',
          'BIRTHDAY_TODAY',
          'BIRTHDAY_IN_X_DAYS',
          'IS_TODAY',
          'WAS_YESTERDAY',
          'IS_TOMORROW',
          'IN_X_DAYS'
        ]
      default:
        return []
    }
  }

  //Obtener las opciones de condiciones filtradas para un custom field específico
  const getFilteredConditionOptions = (customFieldId: number): SelectOption[] => {
    if (!customFieldId) return []

    const customField = customFieldsDataRef.value.find((field: ICustomField) => field.id === customFieldId)
    if (!customField) return conditionOptionsRef.value

    const allowedConditions = getConditionsForDataType(customField.dataType)
    return conditionOptionsRef.value.filter((option: SelectOption) =>
      allowedConditions.includes(option.value as string)
    )
  }

  //Definir qué condiciones no necesitan input de valor
  const conditionsWithoutValue = [
    'IS_EMPTY',
    'NOT_EMPTY',
    'BIRTHDAY_TODAY',
    'IS_TODAY',
    'WAS_YESTERDAY',
    'IS_TOMORROW'
  ]

  //Definir qué condiciones necesitan input numérico (independientemente del tipo de campo)
  const numericInputConditions = [
    'BIRTHDAY_IN_X_DAYS',
    'IN_X_DAYS'
  ]

  //Definir qué condiciones necesitan input de fecha (para campos de fecha)
  const dateInputConditions = [
    'EQUALS',
    'NOT_EQUALS',
    'GREATER_THAN',
    'LESS_THAN',
    'GREATER_OR_EQUAL',
    'LESS_OR_EQUAL'
  ]

  //Definir qué condiciones necesitan input numérico para campos numéricos
  const numericFieldConditions = [
    'GREATER_THAN',
    'LESS_THAN',
    'GREATER_OR_EQUAL',
    'LESS_OR_EQUAL'
  ]

  //Definir qué condiciones necesitan dos valores
  const betweenConditions = [
    'BETWEEN',
    'BETWEEN_DATES'
  ]

  const needsValueInput = (conditionType: string) => {
    return !conditionsWithoutValue.includes(conditionType)
  }

  const isNumericInput = (conditionType: string, customFieldId?: number) => {
    //Condiciones que siempre necesitan input numérico (días)
    if (numericInputConditions.includes(conditionType)) {
      return true
    }

    //Para campos numéricos, ciertas condiciones necesitan input numérico
    if (customFieldId) {
      const customField = customFieldsDataRef.value.find((field: ICustomField) => field.id === customFieldId)
      if (customField?.dataType === 'number' && numericFieldConditions.includes(conditionType)) {
        return true
      }
    }

    return false
  }

  const isDateInput = (conditionType: string, customFieldId?: number) => {
    //Para campos de fecha, ciertas condiciones necesitan input de fecha
    if (customFieldId) {
      const customField = customFieldsDataRef.value.find((field: ICustomField) => field.id === customFieldId)
      if (customField?.dataType === 'date' && dateInputConditions.includes(conditionType)) {
        return true
      }
    }

    return false
  }

  const isBetweenInput = (conditionType: string) => {
    return betweenConditions.includes(conditionType)
  }

  const isDateBetweenInput = (conditionType: string) => {
    return conditionType === 'BETWEEN_DATES'
  }

  const getPlaceholderText = (conditionType: string, t: (key: string) => string) => {
    //Condiciones específicas de fechas que necesitan días
    if (conditionType === 'BIRTHDAY_IN_X_DAYS' || conditionType === 'IN_X_DAYS') {
      return t('campaign.days_number')
    }

    //Condiciones numéricas puras
    if (isNumericInput(conditionType)) {
      return t('campaign.numeric_value')
    }

    //Condiciones between
    if (isBetweenInput(conditionType)) {
      return t('campaign.value_range')
    }

    //Por defecto
    return t('campaign.value')
  }

  //Funciones para manejar los valores de "between"
  const updateBetweenValue = (index: number, type: 'min' | 'max', value: string) => {
    if (!betweenValues.value[index]) {
      betweenValues.value[index] = { min: '', max: '' }
    }

    betweenValues.value[index][type] = value

    //Actualizar el valor del rule combinando min y max
    const rule = campaignRulesRef.value[index]
    if (rule) {
      const { min, max } = betweenValues.value[index]
      rule.value = `${min},${max}`
    }
  }

  const getBetweenValue = (index: number, type: 'min' | 'max'): string => {
    return betweenValues.value[index]?.[type] || ''
  }

  //Inicializar valores de between cuando las reglas cambien
  const initializeBetweenValues = () => {
    const newBetweenValues: Record<number, { min: string; max: string }> = {}

    campaignRulesRef.value.forEach((rule: CampaignRule, index: number) => {
      //Inicializar valores de between si no existen
      if (!betweenValues.value[index]) {
        //Si ya hay un valor en formato "min,max", parsearlo
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
    getFilteredConditionOptions,
    needsValueInput,
    isNumericInput,
    isDateInput,
    isBetweenInput,
    isDateBetweenInput,
    getPlaceholderText,
    updateBetweenValue,
    getBetweenValue,
    initializeBetweenValues,
    clearBetweenValues,
    updateBetweenValuesAfterRemove
  }
}
