<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue'

import DatePicker from 'primevue/datepicker'

export default defineComponent({
  name: 'AppTimePicker',
  components: {
    DatePicker,
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
        if (newValue instanceof Date) {
          selectedTime.value = newValue
        } else {
          selectedTime.value = null
        }
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
    <DatePicker
      v-model="selectedTime"
      timeOnly
      size="small"
      inputClass="!w-full !rounded-xl"
      class="!w-full rounded-xl"
      :class="{ 'p-invalid': errorMessage.length > 0 }"
      :hourFormat="hourFormat"
    />
    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style scoped></style>
