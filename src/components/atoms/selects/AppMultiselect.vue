<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import MultiSelect, { type MultiSelectChangeEvent } from 'primevue/multiselect'

import type { SelectOption } from './types/select-option.types'

export default defineComponent({
  name: 'AppMultiselect',
  components: {
    MultiSelect,
    FloatLabel,
    IconField,
    InputIcon,
  },
  props: {
    modelValue: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      required: true,
    },
    placeholder: {
      type: String,
      default: 'Seleccione...',
    },
    label: {
      type: String,
      default: '',
    },
    showClear: {
      type: Boolean,
      default: true,
    },
    customClass: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    showErrorMessage: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectedValues = ref<string[]>([])
    watch(
      () => props.modelValue,
      (newValue) => {
        selectedValues.value = newValue
      },
      { immediate: true },
    )

    watch(selectedValues, (value) => {
      emit('update:modelValue', value)
    })

    const handleChange = (event: MultiSelectChangeEvent) => {
      const value = event.value
      emit('update:modelValue', value)
    }

    return {
      selectedValues,
      handleChange,
    }
  },
})
</script>

<template>
  <div class="w-full min-w-0">
    <!-- Con ícono -->
    <FloatLabel v-if="$slots.icon">
      <IconField class="w-full">
        <InputIcon>
          <slot name="icon" />
        </InputIcon>
        <MultiSelect
          v-model="selectedValues"
          :options="options"
          optionLabel="name"
          optionValue="value"
          :placeholder="placeholder"
          :showClear="showClear"
          size="small"
          class="w-full !pl-10 !rounded-xl"
          :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
          @change="handleChange"
        />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Sin ícono -->
    <FloatLabel v-else>
      <MultiSelect
        v-model="selectedValues"
        :options="options"
        optionLabel="name"
        optionValue="value"
        :placeholder="placeholder"
        :showClear="showClear"
        size="small"
        class="w-full !rounded-xl"
        :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
        @change="handleChange"
      />
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Mensaje de error -->
    <div v-if="showErrorMessage && errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
