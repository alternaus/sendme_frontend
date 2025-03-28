<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'

export default defineComponent({
  name: 'AppDatePicker',
  components: {
    DatePicker,
    FloatLabel, IconField, InputIcon
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
    placeholder: {
      type: String,
      default: 'Seleccione una fecha',
    },
    showIcon: {
      type: Boolean,
      default: false,
    },
    dateFormat: {
      type: String,
      default: 'dd/mm/yy',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    customClass: {
      type: String,
      default: '',
    },
    showTime: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectedDate = ref<Date | null>(null)

    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue instanceof Date) {
          selectedDate.value = newValue
        } else {
          selectedDate.value = null
        }
      },
      { immediate: true },
    )

    let previousValue: Date | null = selectedDate.value

    watch(
      selectedDate,
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
      selectedDate,
    }
  },
})
</script>
<template>
  <div class="w-full">
    <FloatLabel v-if="$slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon"></slot>
        </InputIcon>
        <DatePicker v-model="selectedDate" size="small" :placeholder="placeholder" :showIcon="false"
          :dateFormat="dateFormat" input-class="!w-full !rounded-xl" class="!w-full"
          :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]" />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>
    <FloatLabel v-else>
      <DatePicker v-model="selectedDate" size="small" :placeholder="placeholder" :showIcon="showIcon"
        :dateFormat="dateFormat" input-class="!w-full !rounded-xl" class="!w-full"
        :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]" />
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
