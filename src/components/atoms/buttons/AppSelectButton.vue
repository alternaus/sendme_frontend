<script setup lang="ts">
import { computed } from 'vue'

import SelectButton from 'primevue/selectbutton'

import type { SelectButtonOption } from './types/select-button-options.type'

interface Props {
  modelValue: string[] | string | number | boolean
  options: SelectButtonOption[]
  optionLabel?: string
  optionValue?: string
  errorMessage?: string
  multiple?: boolean
  disabled?: boolean
  allowEmpty?: boolean
  size?: 'small' | 'large'
  containerClass?: string
  selectButtonClass?: string
  errorClass?: string
  inputId?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  optionLabel: 'name',
  optionValue: 'value',
  errorMessage: '',
  multiple: false,
  disabled: false,
  allowEmpty: false,
  size: 'small',
  containerClass: 'w-full',
  selectButtonClass: 'w-full flex justify-center items-center flex-wrap',
  errorClass: 'text-red-400 dark:text-gray-300 p-0 m-0'
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string[] | string | number | boolean]
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasError = computed(() => (props.errorMessage?.length ?? 0) > 0)

// ID único para el input
const inputId = computed(() => props.inputId || `app-select-button-${crypto.randomUUID()}`)

// Configuración de PrimeVue passthrough
const ptConfig = computed(() => ({
  ...props.pt,
  pcToggleButton: {
    content: ({ context }: { context: { active: boolean } }) => ({
      class: context.active ? 'bg-[var(--p-primary-color)]! text-[var(--p-surface-700)]' : ''
    })
  }
}))
</script>

<template>
  <div :class="containerClass">
    <SelectButton
      v-bind="{
        inputId,
        modelValue: internalValue,
        options,
        optionLabel,
        optionValue,
        multiple,
        disabled,
        allowEmpty,
        size:'small',
        ptOptions,
        ...$attrs
      }"
      :pt="ptConfig"
      :class="[
        selectButtonClass,
        { 'p-invalid': hasError }
      ]"
      @update:model-value="internalValue = $event"
    >
      <template #option="slotProps">
        <slot name="option" :option="slotProps.option" />
      </template>
    </SelectButton>

    <div v-if="hasError" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.p-selectbutton .p-button) {
  padding: 0.5rem 0.75rem;
  width: 100%;
  font-size: 0.875rem;
  /* 14px */
}
</style>
