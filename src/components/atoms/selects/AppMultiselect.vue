<script setup lang="ts">
import { computed, ref, useAttrs, useSlots, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import MultiSelect, { type MultiSelectChangeEvent } from 'primevue/multiselect'

import type { SelectOption } from './types/select-option.types'

type MultiSelectSize = 'small' | 'large'
type MultiSelectDisplay = 'comma' | 'chip'

interface Props {
  modelValue?: (string | number | boolean)[]
  options: SelectOption[]
  label?: string
  placeholder?: string
  showClear?: boolean
  disabled?: boolean
  loading?: boolean
  filter?: boolean
  filterPlaceholder?: string
  filterLocale?: string
  filterMatchMode?: 'startsWith' | 'contains' | 'endsWith'
  filterFields?: string[]
  resetFilterOnHide?: boolean
  display?: MultiSelectDisplay
  selectedItemsLabel?: string
  maxSelectedLabels?: number
  selectionLimit?: number
  showToggleAll?: boolean
  optionLabel?: string
  optionValue?: string
  optionDisabled?: string
  optionGroupLabel?: string
  optionGroupChildren?: string
  size?: MultiSelectSize
  scrollHeight?: string
  autoFilterFocus?: boolean
  selectAll?: boolean
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
  modelValue: () => [],
  label: '',
  placeholder: 'Seleccione...',
  showClear: true,
  disabled: false,
  loading: false,
  filter: false,
  filterPlaceholder: 'Search...',
  filterMatchMode: 'contains',
  resetFilterOnHide: true,
  display: 'comma',
  selectedItemsLabel: '{0} items selected',
  maxSelectedLabels: 3,
  showToggleAll: true,
  optionLabel: 'name',
  optionValue: 'value',
  size: 'small',
  scrollHeight: '200px',
  autoFilterFocus: false,
  selectAll: false,
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
  'update:modelValue': [value: (string | number | boolean)[]]
  'change': [event: MultiSelectChangeEvent]
  'focus': [event: Event]
  'blur': [event: Event]
  'before-show': []
  'before-hide': []
  'show': []
  'hide': []
  'filter': [event: { originalEvent: Event; value: string }]
  'select-all-change': [event: { originalEvent: Event; checked: boolean }]
}>()

const attrs = useAttrs()
const slots = useSlots()

// Generar ID único para el input
const inputId = computed(() => props.inputId || `msel-${crypto.randomUUID()}`)

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

// ptMerged solo cuando hay iconos, pt normal cuando no
const effectivePt = computed(() => {
  return slots.icon ? ptMerged.value : props.pt
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
  const classes = [props.inputClass, props.customClass]
  if (hasError.value) classes.push('p-invalid')
  return classes.filter(Boolean).join(' ')
})

const selectedValues = ref<(string | number | boolean)[]>([])

// Sincronizar con modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    selectedValues.value = newValue || []
  },
  { immediate: true }
)

// Emitir cambios
watch(selectedValues, (newValue) => {
  emit('update:modelValue', newValue)
})

// Manejar eventos
const handleChange = (event: MultiSelectChangeEvent) => {
  selectedValues.value = (event.value as (string | number | boolean)[]) || []
  emit('change', event)
}
</script>

<template>
  <div :class="containerClasses">
    <!-- Con label y icono -->
    <FloatLabel variant="on" v-if="label && $slots.icon">
      <IconField class="w-full">
        <InputIcon>
          <slot name="icon" />
        </InputIcon>
        <MultiSelect
          v-bind="forwardedAttrs"
          :inputId="inputId"
          v-model="selectedValues"
          :options="options"
          :option-label="optionLabel"
          :option-value="optionValue"
          :option-disabled="optionDisabled"
          :option-group-label="optionGroupLabel"
          :option-group-children="optionGroupChildren"
          :show-clear="showClear"
          :disabled="disabled"
          :loading="loading"
          :filter="filter"
          :filter-placeholder="filterPlaceholder"
          :filter-locale="filterLocale"
          :filter-match-mode="filterMatchMode"
          :filter-fields="filterFields"
          :reset-filter-on-hide="resetFilterOnHide"
          :display="display"
          :selected-items-label="selectedItemsLabel"
          :max-selected-labels="maxSelectedLabels"
          :selection-limit="selectionLimit"
          :show-toggle-all="showToggleAll"
          :size="size"
          :scroll-height="scrollHeight"
          :auto-filter-focus="autoFilterFocus"
          :select-all="selectAll"
          :class="inputClasses"
          :pt="effectivePt"
          :pt-options="ptOptions"
          @change="handleChange"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
          @before-show="emit('before-show')"
          @before-hide="emit('before-hide')"
          @show="emit('show')"
          @hide="emit('hide')"
          @filter="emit('filter', $event)"
          @selectall-change="emit('select-all-change', $event)"
        />
      </IconField>
      <label :for="inputId" class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Con label sin icono -->
    <FloatLabel variant="on" v-else-if="label">
      <MultiSelect
        v-bind="forwardedAttrs"
        :inputId="inputId"
        v-model="selectedValues"
        :options="options"
        :option-label="optionLabel"
        :option-value="optionValue"
        :option-disabled="optionDisabled"
        :option-group-label="optionGroupLabel"
        :option-group-children="optionGroupChildren"
        :show-clear="showClear"
        :disabled="disabled"
        :loading="loading"
        :filter="filter"
        :filter-placeholder="filterPlaceholder"
        :filter-locale="filterLocale"
        :filter-match-mode="filterMatchMode"
        :filter-fields="filterFields"
        :reset-filter-on-hide="resetFilterOnHide"
        :display="display"
        :selected-items-label="selectedItemsLabel"
        :max-selected-labels="maxSelectedLabels"
        :selection-limit="selectionLimit"
        :show-toggle-all="showToggleAll"
        :size="size"
        :scroll-height="scrollHeight"
        :auto-filter-focus="autoFilterFocus"
        :select-all="selectAll"
        :class="inputClasses"
        :pt="effectivePt"
        :pt-options="ptOptions"
        @change="handleChange"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @before-show="emit('before-show')"
        @before-hide="emit('before-hide')"
        @show="emit('show')"
        @hide="emit('hide')"
        @filter="emit('filter', $event)"
        @selectall-change="emit('select-all-change', $event)"
      />
      <label :for="inputId" class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Sin label con icono -->
    <IconField v-else-if="$slots.icon" class="w-full">
      <InputIcon>
        <slot name="icon" />
      </InputIcon>
      <MultiSelect
        v-bind="forwardedAttrs"
        :inputId="inputId"
        v-model="selectedValues"
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
        :filter="filter"
        :filter-placeholder="filterPlaceholder"
        :filter-locale="filterLocale"
        :filter-match-mode="filterMatchMode"
        :filter-fields="filterFields"
        :reset-filter-on-hide="resetFilterOnHide"
        :display="display"
        :selected-items-label="selectedItemsLabel"
        :max-selected-labels="maxSelectedLabels"
        :selection-limit="selectionLimit"
        :show-toggle-all="showToggleAll"
        :size="size"
        :scroll-height="scrollHeight"
        :auto-filter-focus="autoFilterFocus"
        :select-all="selectAll"
        :class="inputClasses"
        :pt="effectivePt"
        :pt-options="ptOptions"
        @change="handleChange"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @before-show="emit('before-show')"
        @before-hide="emit('before-hide')"
        @show="emit('show')"
        @hide="emit('hide')"
        @filter="emit('filter', $event)"
        @selectall-change="emit('select-all-change', $event)"
      />
    </IconField>

    <!-- Sin label sin icono -->
    <MultiSelect
      v-else
      v-bind="forwardedAttrs"
      v-model="selectedValues"
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
      :filter="filter"
      :filter-placeholder="filterPlaceholder"
      :filter-locale="filterLocale"
      :filter-match-mode="filterMatchMode"
      :filter-fields="filterFields"
      :reset-filter-on-hide="resetFilterOnHide"
      :display="display"
      :selected-items-label="selectedItemsLabel"
      :max-selected-labels="maxSelectedLabels"
      :selection-limit="selectionLimit"
      :show-toggle-all="showToggleAll"
      :size="size"
      :scroll-height="scrollHeight"
      :auto-filter-focus="autoFilterFocus"
      :select-all="selectAll"
      :class="inputClasses"
      :pt="effectivePt"
      :pt-options="ptOptions"
      @change="handleChange"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
      @before-show="emit('before-show')"
      @before-hide="emit('before-hide')"
      @show="emit('show')"
      @hide="emit('hide')"
      @filter="emit('filter', $event)"
      @selectall-change="emit('select-all-change', $event)"
    />

    <!-- Mensaje de error -->
    <div v-if="showErrorMessage && hasError" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>


