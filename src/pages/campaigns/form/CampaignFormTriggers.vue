<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import DeleteIcon from '@/assets/svg/table-actions/delete.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import { useCampaignTriggerInputs } from '@/pages/campaigns/composables/useCampaignTriggerInputs'
import type { CampaignConditionType } from '@/services/campaign/enums/campaign-condition-type.enum'
import type { ICustomField } from '@/services/custom-field/interfaces/custom-field.interface'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'

import type { CampaignFormFields, CampaignRule } from '../composables/useCampaignForm'

interface Props {
  form: CampaignFormFields
  conditionOptions: SelectOption[]
  addRule: () => void
  removeRule: (index: number) => void
  errors: Partial<Record<string, string | undefined>>
}

const props = defineProps<Props>()

const { t } = useI18n()
const { getCustomFields } = useCustomFieldService()
const customFieldsOptions = ref<SelectOption[]>([])
const customFieldsData = ref<ICustomField[]>([])
const touchedFields = ref<Record<number, boolean>>({})

const campaignRules = computed<CampaignRule[]>(() =>
  props.form.campaignRules.value.map((entry) => entry.value),
)

const {
  getFilteredConditionOptions,
  needsValueInput,
  isNumericInput,
  isDateInput,
  isBetweenInput,
  isDateBetweenInput,
  updateBetweenValue,
  getBetweenValue,
  initializeBetweenValues,
  clearBetweenValues,
  updateBetweenValuesAfterRemove
} = useCampaignTriggerInputs(campaignRules, customFieldsData, computed(() => props.conditionOptions))

onMounted(async () => {
  try {
    const response = await getCustomFields()
    customFieldsData.value = response
    customFieldsOptions.value = response.map((customField) => ({
      name: customField.fieldName,
      value: customField.id,
    }))
  } catch {
  }
})

watch(
  () => campaignRules.value.length,
  () => {
    const newTouchedFields: Record<number, boolean> = {}

    campaignRules.value.forEach((rule, index) => {
      newTouchedFields[index] = touchedFields.value[index] || false
    })

    touchedFields.value = newTouchedFields
    initializeBetweenValues()
  },
  { immediate: true }
)

//Observar cambios en los errores para mostrarlos inmediatamente
watch(
  () => props.errors,
  (newErrors) => {
    if (newErrors && Object.keys(newErrors).length > 0) {
      //Marcar como tocados los campos que tienen errores del servidor
      Object.keys(newErrors).forEach(errorKey => {
        const match = errorKey.match(/campaignRules\[(\d+)\]\./)
        if (match) {
          const ruleIndex = parseInt(match[1])
          if (!isNaN(ruleIndex)) {
            touchedFields.value[ruleIndex] = true
          }
        }
      })
    }
  },
  { deep: true, immediate: true }
)

const getError = (index: number, field: string) => {
  const errorKey = `campaignRules[${index}].${field}`
  const error = props.errors?.[errorKey] || ''
  //Mostrar errores si el campo fue tocado O si ya hay errores (para validación del servidor)
  return (touchedFields.value[index] || error) ? error : ''
}

const hasErrors = (index: number) => {
  return (
    getError(index, 'customFieldId') ||
    getError(index, 'conditionType') ||
    getError(index, 'value')
  )
}

const handleFieldChange = (index: number) => {
  touchedFields.value[index] = true
}

const scrollToLastTrigger = async () => {
  await nextTick()
  const lastTrigger = document.querySelector(`[data-field-index="${campaignRules.value.length - 1}"]`)
  if (lastTrigger) {
    lastTrigger.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const handleAddRule = () => {
  props.addRule()
  scrollToLastTrigger()
}

const handleRemoveRule = (index: number) => {
  props.removeRule(index)
  updateBetweenValuesAfterRemove(index)
  const newTouchedFields: Record<number, boolean> = {}
  Object.entries(touchedFields.value).forEach(([key, value]) => {
    const numKey = Number(key)
    if (numKey < index) {
      newTouchedFields[numKey] = value
    } else if (numKey > index) {
      newTouchedFields[numKey - 1] = value
    }
  })
  touchedFields.value = newTouchedFields
}

const handleConditionChange = (index: number, conditionType: string | number | boolean | null) => {
  const rule = campaignRules.value[index]
  if (rule) {
    rule.conditionType = typeof conditionType === 'string' ? conditionType as CampaignConditionType : null
    rule.value = ''
  }
  clearBetweenValues(index)
  handleFieldChange(index)
}

const handleCustomFieldChange = (index: number, customFieldId: string | number | boolean | null) => {
  const rule = campaignRules.value[index]
  if (rule) {
    rule.customFieldId = typeof customFieldId === 'string' ? customFieldId : String(customFieldId) || ''
    rule.conditionType = null
    rule.value = ''
  }
  clearBetweenValues(index)
  handleFieldChange(index)
}


const handleUpdateBetweenValue = (index: number, type: 'min' | 'max', value: string | number | null) => {
  const stringValue = value !== null ? String(value) : ''
  updateBetweenValue(index, type, stringValue)
  handleFieldChange(index)
}
</script>

<template>
  <div class="flex flex-col h-full">
        <div class="flex-none mb-4">
          <p class="text-center text-neutral-600 dark:text-neutral-300">
            {{ t('campaigns.triggers.configure_triggers') }}
          </p>
        </div>

        <div class="flex-1 overflow-y-auto mb-4" style="max-height: 300px;">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 auto-rows-min">
            <div v-for="(rule, index) in campaignRules" :key="index"
              :data-field-index="index"
              class="p-4 my-2 bg-neutral-50 dark:bg-neutral-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 h-fit"
              :class="{'border border-red-500': hasErrors(index)}">
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <div
                    class="w-8 h-8 flex items-center justify-center bg-[var(--p-primary-color)] dark:text-black rounded-full font-bold text-sm">
                    {{ index + 1 }}
                  </div>
                  <div class="flex gap-2">
                    <DeleteIcon
                      class="w-6 h-6 fill-red-400 dark:fill-red-300 cursor-pointer"
                      @click="handleRemoveRule(index)"
                    />
                  </div>
                </div>

                <div class="space-y-4 mt-2">
                  <AppSelect
                    v-model="rule.customFieldId"
                    :options="customFieldsOptions"
                    :errorMessage="getError(index, 'customFieldId')"
                    :label="t('campaigns.triggers.select_field')"
                    class="w-full"
                    @update:modelValue="handleCustomFieldChange(index, $event)" />

                  <AppSelect
                    v-model="rule.conditionType"
                    :options="getFilteredConditionOptions(rule.customFieldId)"
                    :errorMessage="getError(index, 'conditionType')"
                    :label="t('campaigns.triggers.select_condition')"
                    class="w-full"
                    :disabled="!rule.customFieldId"
                    @update:modelValue="handleConditionChange(index, $event)" />


                  <!-- Input para condiciones que no necesitan valor -->
                  <div v-if="!needsValueInput(rule.conditionType) && rule.conditionType"
                       class="text-sm text-neutral-500 dark:text-neutral-400 p-2 bg-neutral-100 dark:bg-neutral-800 rounded">
                    {{ t('campaigns.triggers.no_value_needed') }}
                  </div>

                  <!-- Input numérico para condiciones que necesitan días -->
                  <AppInput
                    v-else-if="isNumericInput(rule.conditionType, rule.customFieldId)"
                    v-model="rule.value"
                    :errorMessage="getError(index, 'value')"
                    :placeholder="t('campaigns.triggers.numeric_value')"
                    type="number"
                    class="w-full"
                    @update:modelValue="handleFieldChange(index)" />

                  <!-- Input de fecha para condiciones de campos fecha que necesitan comparar fechas -->
                  <AppDatePicker
                    v-else-if="isDateInput(rule.conditionType, rule.customFieldId)"
                    :modelValue="rule.value ? new Date(rule.value) : undefined"
                    :errorMessage="getError(index, 'value')"
                    :placeholder="t('campaigns.triggers.select_date')"
                    class="w-full"
                    @update:modelValue="(date) => { rule.value = date ? date.toISOString().split('T')[0] : ''; handleFieldChange(index); }" />

                  <!-- Input para condición "between" (rango) -->
                  <div v-else-if="isBetweenInput(rule.conditionType)" class="space-y-3">

                    <div class="grid grid-cols-2 gap-3">
                      <!-- Inputs para fechas (between_dates) -->
                      <template v-if="isDateBetweenInput(rule.conditionType)">
                        <AppDatePicker
                          :modelValue="getBetweenValue(index, 'min') ? new Date(getBetweenValue(index, 'min')) : undefined"
                          :errorMessage="getError(index, 'value')"
                          :placeholder="t('campaigns.triggers.range_start_date')"
                          class="w-full"
                          @update:modelValue="(val) => handleUpdateBetweenValue(index, 'min', val ? val.toISOString().split('T')[0] : '')" />
                        <AppDatePicker
                          :modelValue="getBetweenValue(index, 'max') ? new Date(getBetweenValue(index, 'max')) : undefined"
                          :errorMessage="getError(index, 'value')"
                          :placeholder="t('campaigns.triggers.range_end_date')"
                          class="w-full"
                          @update:modelValue="(val) => handleUpdateBetweenValue(index, 'max', val ? val.toISOString().split('T')[0] : '')" />
                      </template>
                      <!-- Inputs para números o texto (between) -->
                      <template v-else>
                        <AppInput
                          :modelValue="getBetweenValue(index, 'min')"
                          :errorMessage="getError(index, 'value')"
                          :placeholder="t('campaigns.triggers.min_value')"
                          :type="isNumericInput(rule.conditionType) ? 'number' : 'text'"
                          class="w-full"
                          @update:modelValue="(val) => handleUpdateBetweenValue(index, 'min', val)" />
                        <AppInput
                          :modelValue="getBetweenValue(index, 'max')"
                          :errorMessage="getError(index, 'value')"
                          :placeholder="t('campaigns.triggers.max_value')"
                          :type="isNumericInput(rule.conditionType) ? 'number' : 'text'"
                          class="w-full"
                          @update:modelValue="(val) => handleUpdateBetweenValue(index, 'max', val)" />
                      </template>
                    </div>

                  </div>

                  <!-- Input de texto por defecto -->
                  <AppInput
                    v-else-if="needsValueInput(rule.conditionType)"
                    v-model="rule.value"
                    :errorMessage="getError(index, 'value')"
                    :placeholder="t('campaigns.triggers.value')"
                    class="w-full"
                    @update:modelValue="handleFieldChange(index)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-none flex justify-center items-center gap-4 py-4">
          <AppButton
            type="button"
            class="!w-fit"
            :label="t('campaigns.triggers.add_trigger')"
            @click="handleAddRule"
            icon="pi pi-plus" />
        </div>
      </div>
</template>

<style scoped></style>
