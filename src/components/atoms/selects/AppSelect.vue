<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import PrimeSelect from 'primevue/select'

import type { SelectOption } from './types/select-option.types'

export default defineComponent({
  name: 'AppSelect',
  components: {
    PrimeSelect,
    FloatLabel, IconField, InputIcon
  },
  props: {
    modelValue: {
      type: [String, Number, null],
      default: null,
    },
    options: {
      type: Array as PropType<SelectOption[]>,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
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
    const selectedOption = ref()
    watch(
      () => props.modelValue,
      (value) => {
        selectedOption.value = value
      },
      { immediate: true },
    )

    watch(selectedOption, (value) => {
      emit('update:modelValue', value)
    })

    return {
      selectedOption,
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
        <PrimeSelect editable v-model="selectedOption" :options="options" optionLabel="name" optionValue="value"
          :placeholder="placeholder" :showClear="showClear" size="small" class="w-full !pl-10 !rounded-xl"
          :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]" />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Sin ícono -->
    <FloatLabel v-else>
      <PrimeSelect editable v-model="selectedOption" :options="options" optionLabel="name" optionValue="value"
        :placeholder="placeholder" :showClear="showClear" size="small" class="w-full !rounded-xl"
        :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]" />
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Mensaje de error -->
    <div v-if="showErrorMessage && errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
