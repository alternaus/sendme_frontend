<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'

interface Props {
  modelValue?: Date | null
  label?: string
  hourFormat?: '12' | '24'
  errorMessage?: string
  customClass?: string
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'large'
  showSeconds?: boolean
  stepHour?: number
  stepMinute?: number
  stepSecond?: number
  containerClass?: string
  inputClass?: string
  errorClass?: string
  inputId?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  hourFormat: '24',
  errorMessage: '',
  customClass: '',
  disabled: false,
  readonly: false,
  size: 'small',
  showSeconds: false,
  stepHour: 1,
  stepMinute: 1,
  stepSecond: 1,
  containerClass: 'w-full',
  inputClass: '!w-full !rounded-xl',
  errorClass: 'text-red-400 dark:text-red-300 p-0 m-0'
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Date | null]
}>()

// ID único para el input
const inputId = computed(() => props.inputId || `app-timepicker-${crypto.randomUUID()}`)

const selectedTime = ref<Date | null>(null)
let previousValue: Date | null = null

watch(
  () => props.modelValue,
  (newValue) => {
    selectedTime.value = newValue instanceof Date ? newValue : null
  },
  { immediate: true }
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
  { deep: true }
)
</script>

<template>
  <div :class="containerClass">
    <FloatLabel variant="on" v-if="$slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon" />
        </InputIcon>
        <DatePicker
          v-bind="{
            modelValue: selectedTime,
            hourFormat,
            disabled,
            readonly,
            size,
            showSeconds,
            stepHour,
            stepMinute,
            stepSecond,
            pt,
            ptOptions,
            inputId,
            ...$attrs
          }"
          timeOnly
          :input-class="inputClass"
          :class="[
            '!w-full',
            customClass,
            { 'p-invalid': errorMessage.length > 0 }
          ]"
          @update:model-value="selectedTime = $event as Date | null"
        />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <FloatLabel variant="on" v-else>
      <DatePicker
        v-bind="{
          modelValue: selectedTime,
          hourFormat,
          disabled,
          readonly,
          size,
          showSeconds,
          stepHour,
          stepMinute,
          stepSecond,
          pt,
          ptOptions,
          inputId,
          ...$attrs
        }"
        timeOnly
        :input-class="inputClass"
        :class="[
          '!w-full',
          customClass,
          { 'p-invalid': errorMessage.length > 0 }
        ]"
        @update:model-value="selectedTime = $event as Date | null"
      />
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <div v-if="errorMessage.length" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style scoped></style>
