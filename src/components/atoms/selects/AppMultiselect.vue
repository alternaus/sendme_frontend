<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import MultiSelect, { type MultiSelectChangeEvent } from 'primevue/multiselect'

import type { SelectOption } from './types/select-option.types'

export default defineComponent({
  name: 'AppMultiselect',
  components: {
    MultiSelect,
    InputGroup,
    InputGroupAddon,
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
    <InputGroup v-if="$slots.icon">
      <InputGroupAddon class="!rounded-l-xl !border-r-0">
        <slot name="icon"></slot>
      </InputGroupAddon>

      <MultiSelect
        v-model="selectedValues"
        :options="options"
        optionLabel="name"
        optionValue="value"
        :placeholder="placeholder"
        :showClear="showClear"
        class="w-full min-w-0 !rounded-r-xl !border-l-0"
        size="small"
        :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
        @change="handleChange"
      />
    </InputGroup>

    <MultiSelect
      v-else
      v-model="selectedValues"
      :options="options"
      optionLabel="name"
      optionValue="value"
      :placeholder="placeholder"
      :showClear="showClear"
      class="w-full min-w-0 !rounded-xl"
      size="small"
      :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
      @change="handleChange"
    />

    <div
      v-if="showErrorMessage && errorMessage.length"
      class="text-red-400 dark:text-red-300 p-0 m-0"
    >
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
