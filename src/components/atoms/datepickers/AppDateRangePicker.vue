<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'

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

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: '',
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

const emit = defineEmits<{
  'update:modelValue': [value: Date[]]
}>()

// Filtrar atributos conflictivos para evitar que sobrescriban props controlados
const blockKeys = [
  'modelValue', 'onUpdate:modelValue',
  'showIcon', 'iconDisplay',
  'inputId', 'placeholder',
  'inputClass', 'pt'
]

// ID único para el input
const inputId = computed(() => props.inputId || `app-daterange-${crypto.randomUUID()}`)

const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const src = (attrs ?? {}) as Record<string, unknown>
  // Filtrar tanto las claves bloqueadas como 'class' que manejamos por separado
  return Object.fromEntries(Object.entries(src).filter(([k]) => !blockKeys.includes(k) && k !== 'class'))
})

// Separar clases del contenedor vs clases del input
const containerClasses = computed(() => {
  const classAttr = attrs.class as string | undefined
  return classAttr ? `${props.containerClass} ${classAttr}` : props.containerClass
})

const internalDates = ref<(Date | null)[]>([])

// Computed para obtener solo las fechas válidas
const validDates = computed(() =>
  internalDates.value.filter((date): date is Date => date instanceof Date)
)

watch(
  () => props.modelValue,
  (newValue) => {
    internalDates.value = newValue || []
  },
  { immediate: true }
)

const handleDateChange = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
  if (Array.isArray(value)) {
    internalDates.value = value
    emit('update:modelValue', validDates.value)
  } else if (value instanceof Date) {
    internalDates.value = [value]
    emit('update:modelValue', [value])
  } else {
    internalDates.value = []
    emit('update:modelValue', [])
  }
}

const hasError = computed(() => (props.errorMessage?.length ?? 0) > 0)
</script>

<template>
  <div :class="containerClasses">
    <FloatLabel  variant="on" v-if="$slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon" />
        </InputIcon>
        <DatePicker
          v-bind="forwardedAttrs"
          :model-value="internalDates"
          :placeholder="placeholder"
          :date-format="dateFormat"
          :disabled="disabled"
          :readonly="readonly"
          :size="size"
          :min-date="minDate"
          :max-date="maxDate"
          :number-of-months="numberOfMonths"
          :show-button-bar="showButtonBar"
          :pt="pt"
          :pt-options="ptOptions"
          :show-time="false"
          :show-icon="false"
          icon-display="input"
          selection-mode="range"
          :input-class="inputClass"
          :class="[
            '!w-full',
            customClass,
            { 'p-invalid': hasError }
          ]"
          :input-id="inputId"
          @update:model-value="handleDateChange"
        />
      </IconField>
      <label class="text-sm text-gray-600 dark:text-gray-300">{{ label }}</label>
    </FloatLabel>

    <FloatLabel variant="on" v-else>
      <DatePicker
        v-bind="forwardedAttrs"
        :model-value="internalDates"
        :placeholder="placeholder"
        :date-format="dateFormat"
        :disabled="disabled"
        :readonly="readonly"
        :size="size"
        :min-date="minDate"
        :max-date="maxDate"
        :number-of-months="numberOfMonths"
        :show-button-bar="showButtonBar"
        :pt="pt"
        :pt-options="ptOptions"
        :show-time="false"
        :show-icon="false"
        icon-display="input"
        selection-mode="range"
        :input-class="inputClass"
        :class="[
          '!w-full',
          customClass,
          { 'p-invalid': hasError }
        ]"
        :input-id="inputId"
        @update:model-value="handleDateChange"
      />
      <label class="text-sm text-gray-600 dark:text-gray-300">{{ label }}</label>
    </FloatLabel>

    <div v-if="hasError" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style scoped></style>
