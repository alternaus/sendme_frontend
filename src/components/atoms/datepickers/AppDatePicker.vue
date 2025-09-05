<script setup lang="ts">
import { computed, ref, useAttrs,watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'

type DatePickerView = 'date' | 'month' | 'year'
type DatePickerSelectionMode = 'single' | 'multiple' | 'range'

interface Props {
  modelValue?: Date | null
  label?: string
  placeholder?: string
  dateFormat?: string
  errorMessage?: string
  customClass?: string
  showTime?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'large'
  minDate?: Date
  maxDate?: Date
  view?: DatePickerView
  selectionMode?: DatePickerSelectionMode
  numberOfMonths?: number
  inline?: boolean
  hourFormat?: '12' | '24'
  showSeconds?: boolean
  showButtonBar?: boolean
  containerClass?: string
  inputClass?: string
  errorClass?: string
  inputId?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: ' ', // Espacio en blanco para que FloatLabel funcione correctamente
  showIcon: false,
  dateFormat: 'dd/mm/yy',
  errorMessage: '',
  customClass: '',
  showTime: false,
  disabled: false,
  readonly: false,
  size: 'small',
  view: 'date',
  selectionMode: 'single',
  numberOfMonths: 1,
  inline: false,
  hourFormat: '24',
  showSeconds: false,
  showButtonBar: false,
  containerClass: 'w-full',
  inputClass: '!w-full !rounded-xl',
  errorClass: 'text-red-400 dark:text-red-300 p-0 m-0'
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
}>()

const selectedDate = ref<Date | null>(null)

// Placeholder efectivo para FloatLabel
/* const effectivePlaceholder = computed(() => {
  // Si el placeholder está vacío o es solo espacios, usar un espacio para FloatLabel
  return props.placeholder?.trim() === '' ? ' ' : props.placeholder
}) */

// Filtrar atributos conflictivos para evitar que sobrescriban props controlados
const blockKeys = [
  'modelValue', 'onUpdate:modelValue',
  'showIcon', 'iconDisplay',
  'inputId', 'placeholder',
  'inputClass', 'pt'
]

// ID único para el input
const inputId = computed(() => props.inputId || `app-datepicker-${crypto.randomUUID()}`)

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

watch(
  () => props.modelValue,
  (newValue) => {
    selectedDate.value = newValue instanceof Date ? newValue : null
  },
  { immediate: true }
)

let previousValue: Date | null = selectedDate.value

watch(
  selectedDate,
  (value) => {
    if (
      (value instanceof Date && previousValue?.getTime() !== value.getTime()) ||
      (value === null && previousValue !== null)
    ) {
      previousValue = value
      emit('update:modelValue', value)
    }
  },
  { deep: true }
)
</script>
<template>
  <div :class="containerClasses">
    <FloatLabel variant="on" v-if="$slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon" />
        </InputIcon>
        <DatePicker
          v-bind="forwardedAttrs"
          :model-value="selectedDate"
          :date-format="dateFormat"
          :show-time="showTime"
          :disabled="disabled"
          :readonly="readonly"
          :size="size"
          :min-date="minDate"
          :max-date="maxDate"
          :view="view"
          :selection-mode="selectionMode"
          :number-of-months="numberOfMonths"
          :inline="inline"
          :hour-format="hourFormat"
          :show-seconds="showSeconds"
          :show-button-bar="showButtonBar"
          :pt="pt"
          :pt-options="ptOptions"
          :show-icon="false"
          icon-display="input"
          :input-class="inputClass"
          :class="[
            '!w-full',
            customClass,
            { 'p-invalid': errorMessage.length > 0 }
          ]"
          :input-id="inputId"
          @update:model-value="selectedDate = $event as Date | null"
        />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <FloatLabel variant="on" v-else>
      <DatePicker
        v-bind="forwardedAttrs"
        :model-value="selectedDate"
        :date-format="dateFormat"
        :show-icon="false"
        icon-display="input"
        :show-time="showTime"
        :disabled="disabled"
        :readonly="readonly"
        :size="size"
        :min-date="minDate"
        :max-date="maxDate"
        :view="view"
        :selection-mode="selectionMode"
        :number-of-months="numberOfMonths"
        :inline="inline"
        :hour-format="hourFormat"
        :show-seconds="showSeconds"
        :show-button-bar="showButtonBar"
        :pt="pt"
        :pt-options="ptOptions"
        :input-class="inputClass"
        :class="[
          '!w-full',
          customClass,
          { 'p-invalid': errorMessage.length > 0 }
        ]"
        :input-id="inputId"
        @update:model-value="selectedDate = $event as Date | null"
      />
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <div v-if="errorMessage.length" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
