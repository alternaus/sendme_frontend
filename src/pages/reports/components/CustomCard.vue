<script lang="ts">
import { defineComponent, type FunctionalComponent, type PropType } from 'vue'

import AuditIcon from '@/assets/svg/report/audit.svg?component'
import MessagesIcon from '@/assets/svg/report/messages.svg?component'
import SendingIcon from '@/assets/svg/report/sending.svg?component'

import { IconTypesReports } from './enums/icon-types-reports.enum'

// Map de iconos
export const IconComponentsReports: Record<IconTypesReports, FunctionalComponent> = {
  [IconTypesReports.MESSAGES]: MessagesIcon,
  [IconTypesReports.AUDIT]: AuditIcon,
  [IconTypesReports.SENDING]: SendingIcon,
}

export default defineComponent({
  props: {
    icon: {
      type: String as PropType<keyof typeof IconTypesReports>,
      required: false,
      default: IconTypesReports.MESSAGES,
    },
    text: {
      type: String,
      default: '',
    },
  },
  setup() {
    return {
      IconComponentsReports,
    }
  },
})
</script>

<template>
  <div
    class="flex flex-col items-center justify-center w-48 h-38 p-4 border-3 border-gray-900 rounded-md dark:border-white hover:shadow-2xl dark:hover:bg-neutral-700 hover:bg-[var(--p-primary-color)] cursor-pointer"
  >
    <component :is="IconComponentsReports[icon]" class="w-12 h-12 dark:fill-white" />
    <small class="mt-3 text-center text-base text-gray-800 font-semibold dark:text-white">{{
      text
    }}</small>
  </div>
</template>
