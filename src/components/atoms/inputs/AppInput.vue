<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'

type InputSize = 'small' | 'large'
type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'

interface Props {
  modelValue?: string | number | null
  type?: InputType
  label?: string
  placeholder?: string
  size?: InputSize
  errorMessage?: string
  showErrorMessage?: boolean
  inputId?: string
  disabled?: boolean
  readonly?: boolean

  // Propiedades específicas para InputText
  maxlength?: number

  // Propiedades específicas para InputNumber
  numberUseGrouping?: boolean
  numberMinFractionDigits?: number
  numberMaxFractionDigits?: number
  numberMin?: number
  numberMax?: number
  numberStep?: number
  numberMode?: 'decimal' | 'currency'
  numberCurrency?: string
  numberLocale?: string
  numberPrefix?: string
  numberSuffix?: string

  // Clases personalizadas
  containerClass?: string
  inputClass?: string
  errorClass?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  size: 'small',
  errorMessage: '',
  showErrorMessage: true,
  inputId: '',
  disabled: false,
  readonly: false,
  numberUseGrouping: false,
  numberStep: 1,
  numberMode: 'decimal',
  numberCurrency: 'USD',
  numberLocale: 'en-US',
  numberPrefix: '',
  numberSuffix: '',
  containerClass: 'w-full',
  inputClass: '!w-full !rounded-xl',
  errorClass: 'text-red-400 dark:text-red-300 p-0 m-0'
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const attrs = useAttrs()

// Filtrar atributos conflictivos
const blockKeys = [
  'modelValue', 'onUpdate:modelValue',
  'class', 'inputClass', 'placeholder', 'id', 'inputId'
]

const forwardedAttrs = computed(() => {
  const src = attrs ?? {}
  return Object.fromEntries(Object.entries(src).filter(([k]) => !blockKeys.includes(k)))
})

// Manejar clases del contenedor
const containerClasses = computed(() => {
  const classAttr = attrs.class as string | undefined
  return classAttr ? `${props.containerClass} ${classAttr}` : props.containerClass
})

// Placeholder efectivo para FloatLabel
/* const effectivePlaceholder = computed(() => {
  return props.placeholder || props.label || ' '
}) */

// Determinar si hay error
const hasError = computed(() => props.errorMessage.length > 0)

// Clases del input con estado de error
const inputClasses = computed(() => {
  const classes = [props.inputClass]
  if (hasError.value) classes.push('p-invalid')
  return classes.join(' ')
})

// ID único para el input
const id = computed(() => props.inputId || `app-input-${crypto.randomUUID()}`)

// Determinar si es número
const isNumber = computed(() =>
  props.type === 'number' || typeof props.modelValue === 'number'
)

// Valores internos
const internalText = ref<string>('')
const internalNumber = ref<number | null>(null)

// Sincronizar con modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (isNumber.value) {
      internalNumber.value =
        typeof newValue === 'number'
          ? newValue
          : Number.isFinite(Number(newValue))
            ? Number(newValue)
            : null
    } else {
      internalText.value = typeof newValue === 'string' ? newValue : String(newValue ?? '')
    }
  },
  { immediate: true }
)

// Emitir cambios
watch(internalText, (newValue) => {
  if (!isNumber.value) emit('update:modelValue', newValue)
})

watch(internalNumber, (newValue) => {
  if (isNumber.value) emit('update:modelValue', newValue)
})
</script>

<template>
  <div :class="containerClasses">
    <!-- Con label y FloatLabel -->
    <FloatLabel v-if="label && $slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon" />
        </InputIcon>

        <!-- Number input -->
        <InputNumber
          v-if="isNumber"
          v-bind="forwardedAttrs"
          v-model="internalNumber"
          :input-id="id"
          :size="size"
          :disabled="disabled"
          :readonly="readonly"
          :min="numberMin"
          :max="numberMax"
          :step="numberStep"
          :use-grouping="numberUseGrouping"
          :min-fraction-digits="numberMinFractionDigits"
          :max-fraction-digits="numberMaxFractionDigits"
          :mode="numberMode"
          :currency="numberCurrency"
          :locale="numberLocale"
          :prefix="numberPrefix"
          :suffix="numberSuffix"
          :input-class="inputClasses"
          :pt="pt"
          :pt-options="ptOptions"
          class="!w-full"
        />

        <!-- Text input -->
        <InputText
          v-else
          v-bind="forwardedAttrs"
          :id="id"
          v-model="internalText"
          :type="type"
          :size="size"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :class="inputClasses"
          :pt="pt"
          :pt-options="ptOptions"
        />
      </IconField>
      <label class="text-sm" :for="id">{{ label }}</label>
    </FloatLabel>

    <FloatLabel v-else-if="label">
      <!-- Number input -->
      <InputNumber
        v-if="isNumber"
        v-bind="forwardedAttrs"
        v-model="internalNumber"
        :input-id="id"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :min="numberMin"
        :max="numberMax"
        :step="numberStep"
        :use-grouping="numberUseGrouping"
        :min-fraction-digits="numberMinFractionDigits"
        :max-fraction-digits="numberMaxFractionDigits"
        :mode="numberMode"
        :currency="numberCurrency"
        :locale="numberLocale"
        :prefix="numberPrefix"
        :suffix="numberSuffix"
        :input-class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
        class="!w-full"
      />

      <!-- Text input -->
      <InputText
        v-else
        v-bind="forwardedAttrs"
        :id="id"
        v-model="internalText"
        :type="type"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
      />
      <label class="text-sm" :for="id">{{ label }}</label>
    </FloatLabel>

    <!-- Sin label, solo input -->
    <IconField v-else-if="$slots.icon">
      <InputIcon>
        <slot name="icon" />
      </InputIcon>

      <!-- Number input -->
      <InputNumber
        v-if="isNumber"
        v-bind="forwardedAttrs"
        v-model="internalNumber"
        :input-id="id"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :min="numberMin"
        :max="numberMax"
        :step="numberStep"
        :use-grouping="numberUseGrouping"
        :min-fraction-digits="numberMinFractionDigits"
        :max-fraction-digits="numberMaxFractionDigits"
        :mode="numberMode"
        :currency="numberCurrency"
        :locale="numberLocale"
        :prefix="numberPrefix"
        :suffix="numberSuffix"
        :input-class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
        class="!w-full"
      />

      <!-- Text input -->
      <InputText
        v-else
        v-bind="forwardedAttrs"
        :id="id"
        v-model="internalText"
        :type="type"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
      />
    </IconField>

    <template v-else>
      <!-- Number input -->
      <InputNumber
        v-if="isNumber"
        v-bind="forwardedAttrs"
        v-model="internalNumber"
        :input-id="id"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :min="numberMin"
        :max="numberMax"
        :step="numberStep"
        :use-grouping="numberUseGrouping"
        :min-fraction-digits="numberMinFractionDigits"
        :max-fraction-digits="numberMaxFractionDigits"
        :mode="numberMode"
        :currency="numberCurrency"
        :locale="numberLocale"
        :prefix="numberPrefix"
        :suffix="numberSuffix"
        :input-class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
        class="!w-full"
      />

      <!-- Text input -->
      <InputText
        v-else
        v-bind="forwardedAttrs"
        :id="id"
        v-model="internalText"
        :type="type"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
      />
    </template>

    <div v-if="showErrorMessage && hasError" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style scoped>
/* Ocultar flechas para inputs nativos si llegas a usar type="number" */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
