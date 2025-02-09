<script lang="ts">
import { defineComponent, ref, watch, type PropType } from 'vue'
import MultiSelect, { type MultiSelectChangeEvent } from 'primevue/multiselect'
import type { SelectOption } from './types/select-option.types'

export default defineComponent({
  name: 'AppMultiselect',
  components: {
    MultiSelect,
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
    label: {
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
    const selectedValue = ref<string[]>(props.modelValue)

    watch(selectedValue, (value: string[]) => {
      emit('update:modelValue', value)
    })

    const handleChange = (event: MultiSelectChangeEvent) => {
      const value = event.value
      emit('update:modelValue', value)
    }

    return {
      selectedValue,
      handleChange,
    }
  },
})
</script>

<template>
  <div class="w-full">
    <!-- ✅ Etiqueta -->
    <label v-if="label" class="text-gray-700 dark:text-neutral-300">{{ label }}</label>

    <!-- ✅ MultiSelect -->
    <MultiSelect
      v-model="selectedValue"
      :options="options"
      optionLabel="name"
      class="w-full rounded-md border-gray-300 dark:border-gray-600"
      placeholder="Seleccione..."
      :class="{ 'p-invalid': errorMessage.length > 0 }"
      @change="handleChange"
    />

    <!-- 🔴 Error Handling -->
    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
