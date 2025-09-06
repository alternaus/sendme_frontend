<script setup lang="ts">
import { computed } from 'vue'

import { type FieldEntry } from 'vee-validate'
import { useI18n } from 'vue-i18n'

import CredentialIcon from '@/assets/svg/credential.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import DescriptionIcon from '@/assets/svg/description.svg?component'
import NumberIcon from '@/assets/svg/number.svg?component'
import InformationIcon from '@/assets/svg/table-actions/information.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'

import { type CustomValue } from '../composables/useContactForm'

interface CustomField {
  id:string
  fieldName: string
  dataType: string
}

interface Props {
  customValues: FieldEntry<CustomValue>[]
  customFields: CustomField[]
  errors?: Record<string, string | undefined>
  touchedFields?: Record<string, boolean>
}

interface Emits {
  (e: 'field-change', index: number, field: string): void
  (e: 'date-change', value: Date | null, custom: FieldEntry<CustomValue>, index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const getError = (index: number, field: string): string => {
  const errorKey = `customValues[${index}].${field}`
  return props.touchedFields?.[errorKey] ? (props.errors?.[errorKey] || '') : ''
}

const handleCustomFieldChange = (index: number, field: string): void => {
  emit('field-change', index, field)
}

const handleDateChange = (value: Date | null, custom: FieldEntry<CustomValue>, index: number): void => {
  if (custom.value) {
    custom.value.value = value ? value.toISOString() : null
    emit('date-change', value, custom, index)
  }
}

const getFieldDataType = (customFieldId?:string): string => {
  if (!customFieldId) return 'string'
  return props.customFields.find((field) => field.id === customFieldId)?.dataType || 'string'
}

const getFieldName = (customFieldId?:string): string => {
  if (!customFieldId) return ''
  return props.customFields.find((field) => field.id === customFieldId)?.fieldName || `Campo #${customFieldId}`
}

const getFieldIcon = (customFieldId?:string) => {
  if (!customFieldId) return CredentialIcon
  const dataType = getFieldDataType(customFieldId)
  switch (dataType) {
    case 'string':
      return DescriptionIcon
    case 'number':
      return NumberIcon
    case 'date':
      return DateIcon
    default:
      return CredentialIcon
  }
}

const containerClasses = computed(() => ({
  'h-auto': props.customValues.length <= 3,
  'h-[300px] overflow-y-auto pr-2': props.customValues.length > 3
}))
</script>

<template>
  <AppCard class="w-full shadow-lg p-6 mt-4">
    <template #content>
      <div class="flex items-center justify-center gap-2 mb-4">
        <InformationIcon class="w-8 h-8 dark:fill-white" />
        <h2 class="text-center text-xl font-semibold">
          {{ t('general.personalized_information') }}
        </h2>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 custom-fields-container"
        :class="containerClasses"
      >
        <div v-if="customValues.length === 0" class="col-span-full text-center py-8">
          {{ t('contact.no_custom_fields') }}
        </div>

        <div
          v-for="(custom, index) in customValues"
          :key="index"
          class="flex flex-col gap-1"
        >
          <label class="text-sm font-medium">
            {{ getFieldName(custom.value.customFieldId) }}
          </label>

          <template v-if="getFieldDataType(custom.value.customFieldId) === 'string'">
            <AppInput
              v-model="custom.value.value"
              type="text"
              class="w-full rounded-md"
              :error-message="getError(index, 'value')"
              @update:model-value="() => handleCustomFieldChange(index, 'value')"
            >
              <template #icon>
                <component :is="getFieldIcon(custom.value.customFieldId)" class="w-4 h-4 dark:fill-white" />
              </template>
            </AppInput>
          </template>

          <template v-else-if="getFieldDataType(custom.value.customFieldId) === 'number'">
            <AppInput
              v-model="custom.value.value"
              type="number"
              class="w-full rounded-md"
              :error-message="getError(index, 'value')"
              @update:model-value="() => handleCustomFieldChange(index, 'value')"
            >
              <template #icon>
                <component :is="getFieldIcon(custom.value.customFieldId)" class="w-4 h-4 dark:fill-white" />
              </template>
            </AppInput>
          </template>

          <template v-else-if="getFieldDataType(custom.value.customFieldId) === 'date'">
            <AppDatePicker
              :model-value="custom.value.value ? new Date(custom.value.value) : null"
              @update:model-value="(val) => handleDateChange(val, custom, index)"
              class="w-full rounded-md"
              placeholder="Seleccione una fecha (opcional)"
              :error-message="getError(index, 'value')"
            >
              <template #icon>
                <component :is="getFieldIcon(custom.value.customFieldId)" class="w-4 h-4 dark:fill-white" />
              </template>
            </AppDatePicker>
          </template>

          <template v-else>
            <div class="text-xs text-gray-500">{{ t('contact.unknown_field_type') }}</div>
            <AppInput
              v-model="custom.value.value"
              type="text"
              class="w-full rounded-md"
              :error-message="getError(index, 'value')"
              @update:model-value="() => handleCustomFieldChange(index, 'value')"
            >
              <template #icon>
                <component :is="getFieldIcon(custom.value.customFieldId)" class="w-4 h-4 dark:fill-white" />
              </template>
            </AppInput>
          </template>
        </div>
      </div>
    </template>
  </AppCard>
</template>
