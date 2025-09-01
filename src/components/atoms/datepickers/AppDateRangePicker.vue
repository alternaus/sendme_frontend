<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AppDatePicker from './AppDatePicker.vue'

interface Props {
  modelValue?: Date[]
  label?: string
  placeholder?: string
  dateFormat?: string
  errorMessage?: string
  customClass?: string
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'large'
  minDate?: Date
  maxDate?: Date
  numberOfMonths?: number
  showButtonBar?: boolean
  containerClass?: string
  inputClass?: string
  errorClass?: string
  inputId?: string
  pt?: object
  ptOptions?: object
}

interface Emits {
  'update:modelValue': [value: Date[]]
}

// ID único para el input
const inputId = computed(() => props.inputId || `app-daterange-${crypto.randomUUID()}`)

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: '',
  placeholder: '',
  dateFormat: 'dd/mm/yy',
  errorMessage: '',
  customClass: '',
  disabled: false,
  readonly: false,
  size: 'small',
  numberOfMonths: 1,
  showButtonBar: false,
  containerClass: 'w-full',
  inputClass: '!w-full !rounded-xl',
  errorClass: 'text-red-400 dark:text-red-300 p-0 m-0'
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<Emits>()

const internalDates = ref<(Date | null)[]>([])

watch(
  () => props.modelValue,
  (newValue) => {
    internalDates.value = newValue || []
  },
  { immediate: true }
)

const handleDateChange = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
  const dateArray = Array.isArray(value) ? value : []
  internalDates.value = dateArray

  const validDates = dateArray.filter(date => date !== null && date instanceof Date)
  const hasCompleteDateRange = validDates.length === 2 && dateArray.length === 2

  if (hasCompleteDateRange) {
    emit('update:modelValue', dateArray as Date[])
  } else if (dateArray.length === 0) {
    emit('update:modelValue', [])
  }
}
</script>

<template>
  <AppDatePicker
    :model-value="internalDates as any"
    :label="label"
    :placeholder="placeholder"
    :date-format="dateFormat"
    :error-message="errorMessage"
    :custom-class="customClass"
    :disabled="disabled"
    :readonly="readonly"
    :size="size"
    :min-date="minDate"
    :max-date="maxDate"
    :number-of-months="numberOfMonths"
    :show-button-bar="showButtonBar"
    :container-class="containerClass"
    :input-class="inputClass"
    :error-class="errorClass"
    :pt="pt"
    :pt-options="ptOptions"
    :show-time="false"
    selection-mode="range"
    v-bind="$attrs"
    :input-id="inputId"
    @update:model-value="handleDateChange"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
  </AppDatePicker>
</template>
