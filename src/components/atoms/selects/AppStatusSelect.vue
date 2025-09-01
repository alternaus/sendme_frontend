<script setup lang="ts">
import { computed } from 'vue'

import { type StatusType,useStatusColors } from '@/composables/useStatusColors'

import AppSelect from './AppSelect.vue'
import type { SelectOption } from './types/select-option.types'

interface Props {
  modelValue?: string | number | boolean | null
  statusType: StatusType
  label?: string
  placeholder?: string
  disabled?: boolean
  errorMessage?: string
  required?: boolean
  showColors?: boolean
  inputId?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: 'Seleccionar estado',
  disabled: false,
  errorMessage: '',
  required: false,
  showColors: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean | null]
}>()

const { getStatusOptions } = useStatusColors()

const statusOptions = computed<SelectOption[]>(() => {
  const options = getStatusOptions(props.statusType)

  return options.map(option => ({
    name: option.label,
    value: option.value,
    meta: props.showColors ? {
      severity: option.severity
    } : undefined
  }))
})

const updateValue = (value: string | number | boolean | null) => {
  emit('update:modelValue', value)
}

// ID único para el input
const inputId = computed(() => props.inputId || `app-status-select-${crypto.randomUUID()}`)
</script>

<template>
  <AppSelect
    :model-value="modelValue"
    :options="statusOptions"
    :label="label"
    :placeholder="placeholder"
    :disabled="disabled"
    :error-message="errorMessage"
    :required="required"
    @update:model-value="updateValue"
    :input-id="inputId"
  >
    <!-- Slot para pasar el icono al AppSelect subyacente -->
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>

    <!-- Slot para personalizar opciones con indicador de severity -->
    <template v-if="showColors" #option="{ option }">
      <div class="flex items-center gap-2">
        <div
          v-if="option.meta"
          class="w-3 h-3 rounded-full"
          :class="{
            'bg-green-500': option.meta.severity === 'success',
            'bg-red-500': option.meta.severity === 'danger',
            'bg-yellow-500': option.meta.severity === 'warning',
            'bg-blue-500': option.meta.severity === 'info',
            'bg-gray-500': option.meta.severity === 'secondary',
            'bg-gray-700': option.meta.severity === 'contrast'
          }"
        ></div>
        <span>{{ option.name }}</span>
      </div>
    </template>
  </AppSelect>
</template>
