<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'

export default defineComponent({
  name: 'AppTimePicker',
  components: {
    DatePicker,
    FloatLabel,
    IconField,
    InputIcon,
  },
  props: {
    modelValue: {
      type: [Date, null] as PropType<Date | null>,
      default: null,
    },
    label: {
      type: String,
      default: '',
    },
    hourFormat: {
      type: String as () => '12' | '24',
      default: '12',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectedTime = ref<Date | null>(null)
    let previousValue: Date | null = null

    watch(
      () => props.modelValue,
      (newValue) => {
        selectedTime.value = newValue instanceof Date ? newValue : null
      },
      { immediate: true },
    )

    watch(
      selectedTime,
      (value) => {
        if (
          (value instanceof Date && previousValue?.getTime() !== value.getTime()) ||
          (value === null && previousValue !== null)
        ) {
          previousValue = value
          emit('update:modelValue', value)
        }
      },
      { deep: true },
    )

    return {
      selectedTime,
    }
  },
})
</script>

<template>
  <div class="w-full">
    <FloatLabel v-if="$slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon" />
        </InputIcon>
        <DatePicker v-model="selectedTime" timeOnly size="small" :hourFormat="hourFormat"
          input-class="!w-full !rounded-xl" class="!w-full"
          :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]" />
      </IconField>
      <label>{{ label }}</label>
    </FloatLabel>

    <FloatLabel v-else>
      <DatePicker v-model="selectedTime" timeOnly size="small" :hourFormat="hourFormat"
        input-class="!w-full !rounded-xl" class="!w-full"
        :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]" />
      <label>{{ label }}</label>
    </FloatLabel>

    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style scoped></style>
