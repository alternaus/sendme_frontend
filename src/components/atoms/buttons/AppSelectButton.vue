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
  size?: 'small' | 'large'
  containerClass?: string
  selectButtonClass?: string
  errorClass?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  optionLabel: 'name',
  optionValue: 'value',
  errorMessage: '',
  multiple: true,
  disabled: false,
  size: 'small',
  containerClass: 'w-full',
  selectButtonClass: 'w-full flex justify-center items-center flex-wrap',
  errorClass: 'text-red-400 dark:text-red-300 p-0 m-0'
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
</script>

<template>
  <div :class="containerClass">
    <SelectButton
      v-bind="{
        modelValue: internalValue,
        options,
        optionLabel,
        optionValue,
        multiple,
        disabled,
        size,
        pt,
        ptOptions,
        ...$attrs
      }"
      :class="[
        selectButtonClass,
        { 'p-invalid': hasError }
      ]"
      @update:model-value="internalValue = $event"
    />

    <div v-if="hasError" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
