<script setup lang="ts">
import { computed } from 'vue'

import { useDateFormat } from '@/composables/useDateFormat'

interface Props {
  date: string | Date | null | undefined
  format?: 'date' | 'time' | 'datetime'
  customFormat?: string
  showTimezone?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  format: 'datetime',
  customFormat: undefined,
  showTimezone: false
})

const dateFormatting = useDateFormat()

const formattedValue = computed<string>(() => {
  if (!props.date) return ''

  if (props.customFormat) {
    return dateFormatting.formatDate(props.date, props.customFormat)
  }

  switch (props.format) {
    case 'date':
      return dateFormatting.formatDate(props.date)
    case 'time':
      return dateFormatting.formatTime(props.date)
    case 'datetime':
    default:
      return dateFormatting.formatDateTime(props.date)
  }
})

const displayValue = computed<string>(() => {
  if (props.showTimezone) {
    return `${formattedValue.value} (${dateFormatting.timezone.value})`
  }
  return formattedValue.value
})
</script>

<template>
  <span>{{ displayValue }}</span>
</template>
