<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'

type NumberSize = 'small' | 'large'
type NumberMode = 'decimal' | 'currency'
type ButtonLayout = 'stacked' | 'horizontal' | 'vertical'

interface Props {
  modelValue?: number | null
  label?: string
  placeholder?: string
  size?: NumberSize
  errorMessage?: string
  showErrorMessage?: boolean
  inputId?: string
  disabled?: boolean
  readonly?: boolean
  min?: number
  max?: number
  step?: number
  showButtons?: boolean
  buttonLayout?: ButtonLayout
  incrementButtonClass?: string
  decrementButtonClass?: string
  incrementButtonIcon?: string
  decrementButtonIcon?: string
  mode?: NumberMode
  currency?: string
  locale?: string
  localeMatcher?: string
  suffix?: string
  prefix?: string
  minFractionDigits?: number
  maxFractionDigits?: number
  useGrouping?: boolean
  containerClass?: string
  inputClass?: string
  errorClass?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: '',
  size: 'small',
  errorMessage: '',
  showErrorMessage: true,
  disabled: false,
  readonly: false,
  min: undefined,
  max: undefined,
  step: 1,
  showButtons: false,
  buttonLayout: 'stacked',
  mode: 'decimal',
  currency: 'USD',
  locale: 'en-US',
  localeMatcher: 'best fit',
  suffix: '',
  prefix: '',
  useGrouping: true,
  containerClass: 'w-full',
  inputClass: '!w-full !rounded-xl',
  errorClass: 'text-red-400 dark:text-red-300 p-0 m-0'
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const attrs = useAttrs()

// Filtrar atributos conflictivos
const blockKeys = [
  'modelValue', 'onUpdate:modelValue',
  'class', 'inputClass', 'placeholder'
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
const inputId = computed(() => props.inputId || `app-input-number-${crypto.randomUUID()}`)

const internalValue = ref<number | null>(null)

// Sincronizar con modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue
  },
  { immediate: true }
)

// Emitir cambios
watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>
<template>
  <div :class="containerClasses">
    <FloatLabel variant="on" v-if="label && $slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon" />
        </InputIcon>
        <InputNumber
          v-bind="forwardedAttrs"
          v-model="internalValue"
          :size="size"
          :disabled="disabled"
          :readonly="readonly"
          :min="min"
          :max="max"
          :step="step"
          :show-buttons="showButtons"
          :button-layout="buttonLayout"
          :increment-button-class="incrementButtonClass"
          :decrement-button-class="decrementButtonClass"
          :increment-button-icon="incrementButtonIcon"
          :decrement-button-icon="decrementButtonIcon"
          :mode="mode"
          :currency="currency"
          :locale="locale"
          :locale-matcher="localeMatcher"
          :min-fraction-digits="minFractionDigits"
          :max-fraction-digits="maxFractionDigits"
          :prefix="prefix"
          :suffix="suffix"
          :use-grouping="useGrouping"
          :input-class="inputClasses"
          :pt="pt"
          :pt-options="ptOptions"
          :input-id="inputId"
          class="!w-full"
        />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <FloatLabel variant="on" v-else-if="label">
      <InputNumber
        v-bind="forwardedAttrs"
        v-model="internalValue"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :show-buttons="showButtons"
        :button-layout="buttonLayout"
        :increment-button-class="incrementButtonClass"
        :decrement-button-class="decrementButtonClass"
        :increment-button-icon="incrementButtonIcon"
        :decrement-button-icon="decrementButtonIcon"
        :mode="mode"
        :currency="currency"
        :locale="locale"
        :locale-matcher="localeMatcher"
        :min-fraction-digits="minFractionDigits"
        :max-fraction-digits="maxFractionDigits"
        :prefix="prefix"
        :suffix="suffix"
        :use-grouping="useGrouping"
        :input-class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
        :input-id="inputId"
        class="!w-full"
      />
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Sin label -->
    <IconField v-else-if="$slots.icon">
      <InputIcon>
        <slot name="icon" />
      </InputIcon>
      <InputNumber
        v-bind="forwardedAttrs"
        v-model="internalValue"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :show-buttons="showButtons"
        :button-layout="buttonLayout"
        :increment-button-class="incrementButtonClass"
        :decrement-button-class="decrementButtonClass"
        :increment-button-icon="incrementButtonIcon"
        :decrement-button-icon="decrementButtonIcon"
        :mode="mode"
        :currency="currency"
        :locale="locale"
        :locale-matcher="localeMatcher"
        :min-fraction-digits="minFractionDigits"
        :max-fraction-digits="maxFractionDigits"
        :prefix="prefix"
        :suffix="suffix"
        :use-grouping="useGrouping"
        :input-class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
        :input-id="inputId"
        class="!w-full"
      />
    </IconField>

    <InputNumber
      v-else
      v-bind="forwardedAttrs"
      v-model="internalValue"
      :placeholder="placeholder"
      :size="size"
      :disabled="disabled"
      :readonly="readonly"
      :min="min"
      :max="max"
      :step="step"
      :show-buttons="showButtons"
      :button-layout="buttonLayout"
      :increment-button-class="incrementButtonClass"
      :decrement-button-class="decrementButtonClass"
      :increment-button-icon="incrementButtonIcon"
      :decrement-button-icon="decrementButtonIcon"
      :mode="mode"
      :currency="currency"
      :locale="locale"
      :locale-matcher="localeMatcher"
      :min-fraction-digits="minFractionDigits"
      :max-fraction-digits="maxFractionDigits"
      :prefix="prefix"
      :suffix="suffix"
      :use-grouping="useGrouping"
      :input-class="inputClasses"
      :pt="pt"
      :pt-options="ptOptions"
      :input-id="inputId"
      class="!w-full"
    />

    <div v-if="showErrorMessage && hasError" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
