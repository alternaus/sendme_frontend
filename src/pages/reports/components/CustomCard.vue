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
    class="flex flex-col items-center justify-center w-64 sm:w-56 md:w-60 h-36 p-3 border-1 border-gray-900 rounded-xl dark:border-neutral-400 hover:shadow-2xl dark:hover:bg-neutral-700 hover:bg-[var(--p-primary-300)] cursor-pointer transition-all duration-200"
  >
    <component :is="IconComponentsReports[icon]" class="w-10 h-10 md:w-12 md:h-12 dark:fill-neutral-300" />
    <small class="mt-2 text-center text-sm md:text-base text-gray-800 font-semibold dark:text-neutral-300">{{
      text
    }}</small>
  </div>
</template>
