<script setup lang="ts">
import { ref, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'

interface Props {
  modelValue?: Date[]
  label?: string
  placeholder?: string
  dateFormat?: string
  errorMessage?: string
  customClass?: string
}

interface Emits {
  'update:modelValue': [value: Date[]]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: '',
  placeholder: '',
  dateFormat: 'dd/mm/yy',
  errorMessage: '',
  customClass: '',
})

const emit = defineEmits<Emits>()

const selectedDates = ref<Date[]>([])
const internalDates = ref<(Date | null)[]>([])

watch(
  () => props.modelValue,
  (newValue) => {
    selectedDates.value = newValue || []
    internalDates.value = newValue || []
  },
  { immediate: true },
)

const handleDateChange = (value: Date | Date[] | (Date | null)[] | null | undefined) => {
  const dateArray = Array.isArray(value) ? value : []
  internalDates.value = dateArray

  const validDates = dateArray.filter(date => date !== null && date instanceof Date)
  const hasCompleteDateRange = validDates.length === 2 && dateArray.length === 2

  if (hasCompleteDateRange) {
    selectedDates.value = dateArray as Date[]
    emit('update:modelValue', dateArray as Date[])
  } else if (dateArray.length === 0) {
    selectedDates.value = []
    emit('update:modelValue', [])
  }
}
</script>

<template>
  <div class="w-full">
    <FloatLabel v-if="$slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon"></slot>
        </InputIcon>
        <DatePicker
          :modelValue="internalDates"
          size="small"
          :placeholder="placeholder"
          :showIcon="false"
          :dateFormat="dateFormat"
          selectionMode="range"
          :showTime="false"
          input-class="!w-full !rounded-xl"
          class="!w-full"
          :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
          @update:modelValue="handleDateChange"
        />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>
    <FloatLabel v-else>
      <DatePicker
        :modelValue="internalDates"
        size="small"
        :placeholder="placeholder"
        :showIcon="false"
        :dateFormat="dateFormat"
        selectionMode="range"
        :showTime="false"
        input-class="!w-full !rounded-xl"
        class="!w-full"
        :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
        @update:modelValue="handleDateChange"
      />
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
