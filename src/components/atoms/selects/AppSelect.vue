<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import PrimeSelect from 'primevue/select'

import type { SelectOption } from './types/select-option.types'

export default defineComponent({
  name: 'AppSelect',
  components: {
    PrimeSelect,
    InputGroup,
    InputGroupAddon,
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
    placeholder: {
      type: String,
      default: 'Seleccione una opción',
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
    <InputGroup v-if="$slots.icon">
      <InputGroupAddon class="!rounded-l-xl !border-r-0">
        <slot name="icon"></slot>
      </InputGroupAddon>

      <PrimeSelect
        v-model="selectedOption"
        :options="options"
        optionLabel="name"
        optionValue="value"
        :placeholder="placeholder"
        :showClear="showClear"
        class="w-full min-w-0 !rounded-r-xl !border-l-0"
        size="small"
        :class="{ 'p-invalid': errorMessage.length > 0 }"
      />
    </InputGroup>

    <PrimeSelect
      v-else
      v-model="selectedOption"
      :options="options"
      optionLabel="name"
      optionValue="value"
      :placeholder="placeholder"
      :showClear="showClear"
      class="w-full min-w-0 !rounded-xl"
      size="small"
      :class="{ 'p-invalid': errorMessage.length > 0 }"
    />

    <div
      v-if="showErrorMessage && errorMessage.length"
      class="text-red-400 dark:text-red-300 p-0 m-0"
    >
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
