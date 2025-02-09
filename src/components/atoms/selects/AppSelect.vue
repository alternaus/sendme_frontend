<script lang="ts">
import { defineComponent, ref, watch, type PropType } from 'vue'
import PrimeSelect from 'primevue/select'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
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
      type: [String, Object, Number],
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectedOption = ref(props.modelValue)

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
  <div class="w-full">
    <InputGroup v-if="$slots.icon">
      <InputGroupAddon class="!rounded-l-xl !border-r-0">
        <slot name="icon"></slot>
      </InputGroupAddon>

      <PrimeSelect
        v-model="selectedOption"
        :options="options"
        optionLabel="name"
        :placeholder="placeholder"
        :showClear="showClear"
        class="!w-full !rounded-r-xl !border-l-0"
        size="small"
        :class="{ 'p-invalid': errorMessage.length > 0 }"
      />
    </InputGroup>

    <PrimeSelect
      v-else
      v-model="selectedOption"
      :options="options"
      optionLabel="name"
      :placeholder="placeholder"
      :showClear="showClear"
      class="!w-full !rounded-xl"
      size="small"
      :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
    />

    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
