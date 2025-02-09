<script lang="ts">
import { defineComponent, type PropType, computed } from 'vue'
import SelectButton from 'primevue/selectbutton'
import type { SelectButtonOption } from './types/select-button-options.type'

export default defineComponent({
  name: 'AppSelectButton',
  components: {
    SelectButton,
  },
  props: {
    modelValue: {
      type: Array as PropType<SelectButtonOption[]>,
      required: true,
    },
    options: {
      type: Array as PropType<SelectButtonOption[]>,
      required: true,
    },
    optionLabel: {
      type: String,
      default: 'name',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  computed: {
    internalValue: {
      get() {
        return this.modelValue
      },
      set(value: SelectButtonOption[]) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  setup(props) {
    const hasError = computed(() => props.errorMessage.length > 0)

    return {
      hasError,
    }
  },
})
</script>

<template>
  <div class="w-full">
    <SelectButton
      size="small"
      v-model="internalValue"
      :options="options"
      :optionLabel="optionLabel"
      multiple
      class="w-full"
      :class="{ 'p-invalid': hasError }"
      aria-labelledby="multiple"
    />

    <div v-if="hasError" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
