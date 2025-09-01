<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import PrimeSelect from 'primevue/select'

import type { SelectOption } from './types/select-option.types'

type SelectSize = 'small' | 'large'

interface Props {
  modelValue?: string | number | boolean | null
  options: SelectOption[]
  label?: string
  placeholder?: string
  showClear?: boolean
  disabled?: boolean
  loading?: boolean
  editable?: boolean
  filter?: boolean
  filterPlaceholder?: string
  filterLocale?: string
  filterMatchMode?: 'startsWith' | 'contains' | 'endsWith'
  filterFields?: string[]
  resetFilterOnHide?: boolean
  checkmark?: boolean
  highlightOnSelect?: boolean
  optionLabel?: string
  optionValue?: string
  optionDisabled?: string
  optionGroupLabel?: string
  optionGroupChildren?: string
  size?: SelectSize
  scrollHeight?: string
  autoFilterFocus?: boolean
  selectOnFocus?: boolean
  focusOnHover?: boolean
  customClass?: string
  containerClass?: string
  inputClass?: string
  errorClass?: string
  errorMessage?: string
  showErrorMessage?: boolean
  inputId?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: '',
  showClear: true,
  disabled: false,
  loading: false,
  editable: true,
  filter: false,
  filterPlaceholder: 'Search...',
  filterMatchMode: 'contains',
  resetFilterOnHide: true,
  checkmark: false,
  highlightOnSelect: true,
  optionLabel: 'name',
  optionValue: 'value',
  size: 'small',
  scrollHeight: '200px',
  autoFilterFocus: false,
  selectOnFocus: false,
  focusOnHover: true,
  customClass: '',
  containerClass: 'w-full min-w-0',
  inputClass: 'w-full !rounded-xl',
  errorClass: 'text-red-400 dark:text-red-300 p-0 m-0',
  errorMessage: '',
  showErrorMessage: true
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean | null]
  'change': [event: { originalEvent: Event; value: string | number | boolean | null }]
  'focus': [event: Event]
  'blur': [event: Event]
  'before-show': []
  'before-hide': []
  'show': []
  'hide': []
  'filter': [event: { originalEvent: Event; value: string }]
}>()

const attrs = useAttrs()

// Generar ID único para el input
const inputId = computed(() => props.inputId || `sel-${crypto.randomUUID()}`)

// Filtrar atributos conflictivos
const blockKeys = [
  'modelValue', 'onUpdate:modelValue',
  'class', 'placeholder'
]

const forwardedAttrs = computed(() => {
  const src = attrs ?? {}
  return Object.fromEntries(Object.entries(src).filter(([k]) => !blockKeys.includes(k)))
})



// Merges tu pt con el padding para dejar espacio al icono
const ptMerged = computed(() => ({
  root: { class: 'pl-9' },     // espacio para el icono a la izquierda
  label: { class: 'pl-1' },    // pequeño respiro del texto
  dropdown: { class: 'pr-3' }, // evita choque con caret
  ...(props.pt as object || {})
}))

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
  const classes = [props.inputClass, props.customClass]
  if (hasError.value) classes.push('p-invalid')
  return classes.filter(Boolean).join(' ')
})

const selectedOption = ref<string | number | boolean | null>(null)

// Sincronizar con modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    selectedOption.value = newValue
  },
  { immediate: true }
)

// Emitir cambios
watch(selectedOption, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<template>
  <div :class="containerClasses">
    <!-- Con label y icono -->
    <FloatLabel v-if="label && $slots.icon">
      <IconField class="w-full">
        <InputIcon>
          <slot name="icon" />
        </InputIcon>
        <PrimeSelect
          v-bind="forwardedAttrs"
          :inputId="inputId"
          v-model="selectedOption"
          :options="options"
          :option-label="optionLabel"
          :option-value="optionValue"
          :option-disabled="optionDisabled"
          :option-group-label="optionGroupLabel"
          :option-group-children="optionGroupChildren"
          :show-clear="showClear"
          :disabled="disabled"
          :loading="loading"
          :editable="editable"
          :filter="filter"
          :filter-placeholder="filterPlaceholder"
          :filter-locale="filterLocale"
          :filter-match-mode="filterMatchMode"
          :filter-fields="filterFields"
          :reset-filter-on-hide="resetFilterOnHide"
          :checkmark="checkmark"
          :highlight-on-select="highlightOnSelect"
          :size="size"
          :scroll-height="scrollHeight"
          :auto-filter-focus="autoFilterFocus"
          :select-on-focus="selectOnFocus"
          :focus-on-hover="focusOnHover"
          :class="inputClasses"
          :pt="ptMerged"
          :pt-options="ptOptions"
          @change="emit('change', $event)"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
          @before-show="emit('before-show')"
          @before-hide="emit('before-hide')"
          @show="emit('show')"
          @hide="emit('hide')"
          @filter="emit('filter', $event)"
        />
      </IconField>
      <label :for="inputId" class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Con label sin icono -->
    <FloatLabel v-else-if="label">
      <PrimeSelect
        v-bind="forwardedAttrs"
        :inputId="inputId"
        v-model="selectedOption"
        :options="options"
        :option-label="optionLabel"
        :option-value="optionValue"
        :option-disabled="optionDisabled"
        :option-group-label="optionGroupLabel"
        :option-group-children="optionGroupChildren"
        :show-clear="showClear"
        :disabled="disabled"
        :loading="loading"
        :editable="editable"
        :filter="filter"
        :filter-placeholder="filterPlaceholder"
        :filter-locale="filterLocale"
        :filter-match-mode="filterMatchMode"
        :filter-fields="filterFields"
        :reset-filter-on-hide="resetFilterOnHide"
        :checkmark="checkmark"
        :highlight-on-select="highlightOnSelect"
        :size="size"
        :scroll-height="scrollHeight"
        :auto-filter-focus="autoFilterFocus"
        :select-on-focus="selectOnFocus"
        :focus-on-hover="focusOnHover"
        :class="inputClasses"
        :pt="ptMerged"
        :pt-options="ptOptions"
        @change="emit('change', $event)"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @before-show="emit('before-show')"
        @before-hide="emit('before-hide')"
        @show="emit('show')"
        @hide="emit('hide')"
        @filter="emit('filter', $event)"
      />
      <label :for="inputId" class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Sin label con icono -->
    <IconField v-else-if="$slots.icon" class="w-full">
      <InputIcon>
        <slot name="icon" />
      </InputIcon>
      <PrimeSelect
        v-bind="forwardedAttrs"
        v-model="selectedOption"
        :options="options"
        :option-label="optionLabel"
        :option-value="optionValue"
        :option-disabled="optionDisabled"
        :option-group-label="optionGroupLabel"
        :option-group-children="optionGroupChildren"
        :show-clear="showClear"
        :disabled="disabled"
        :loading="loading"
        :editable="editable"
        :filter="filter"
        :filter-placeholder="filterPlaceholder"
        :filter-locale="filterLocale"
        :filter-match-mode="filterMatchMode"
        :filter-fields="filterFields"
        :reset-filter-on-hide="resetFilterOnHide"
        :checkmark="checkmark"
        :highlight-on-select="highlightOnSelect"
        :size="size"
        :scroll-height="scrollHeight"
        :auto-filter-focus="autoFilterFocus"
        :select-on-focus="selectOnFocus"
        :focus-on-hover="focusOnHover"
        :class="inputClasses"
        :pt="ptMerged"
        :pt-options="ptOptions"
        @change="emit('change', $event)"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @before-show="emit('before-show')"
        @before-hide="emit('before-hide')"
        @show="emit('show')"
        @hide="emit('hide')"
        @filter="emit('filter', $event)"
      />
    </IconField>

    <!-- Sin label sin icono -->
    <PrimeSelect
      v-else
      v-bind="forwardedAttrs"
      v-model="selectedOption"
      :options="options"
      :option-label="optionLabel"
      :option-value="optionValue"
      :option-disabled="optionDisabled"
      :option-group-label="optionGroupLabel"
      :option-group-children="optionGroupChildren"
      :placeholder="placeholder"
      :show-clear="showClear"
      :disabled="disabled"
      :loading="loading"
      :editable="editable"
      :filter="filter"
      :filter-placeholder="filterPlaceholder"
      :filter-locale="filterLocale"
      :filter-match-mode="filterMatchMode"
      :filter-fields="filterFields"
      :reset-filter-on-hide="resetFilterOnHide"
      :checkmark="checkmark"
      :highlight-on-select="highlightOnSelect"
      :size="size"
      :scroll-height="scrollHeight"
      :auto-filter-focus="autoFilterFocus"
      :select-on-focus="selectOnFocus"
      :focus-on-hover="focusOnHover"
      :class="inputClasses"
      :pt="pt"
      :pt-options="ptOptions"
      @change="emit('change', $event)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      @before-show="emit('before-show')"
      @before-hide="emit('before-hide')"
      @show="emit('show')"
      @hide="emit('hide')"
      @filter="emit('filter', $event)"
    />

    <!-- Mensaje de error -->
    <div v-if="showErrorMessage && hasError" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>


