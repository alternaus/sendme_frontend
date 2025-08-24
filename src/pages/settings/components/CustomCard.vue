<script lang="ts">
import { defineComponent, type FunctionalComponent, type PropType } from 'vue'

import AdministratorsIcon from '@/assets/svg/administrators.svg?component'
import IntegrationsIcon from '@/assets/svg/integrations.svg?component'
import InformationIcon from '@/assets/svg/table-actions/information.svg?component'

import { IconTypesSettings } from './enums/icon-types-settings.enum'



//Map de iconos
export const IconComponentsSettings: Record<IconTypesSettings, FunctionalComponent> = {
  [IconTypesSettings.CUSTOM_FIELDS]: InformationIcon,
  [IconTypesSettings.USERS]: AdministratorsIcon,
  [IconTypesSettings.INTEGRATIONS]: IntegrationsIcon,
}

export default defineComponent({
  props: {
    icon: {
      type: String as PropType<keyof typeof IconTypesSettings>,
      required: false,
      default: IconTypesSettings.CUSTOM_FIELDS,
    },
    text: {
      type: String,
      default: '',
    },
  },
  setup() {
    return {
      IconComponentsSettings,
    }
  },
})
</script>

<template>
  <div
    class="flex flex-col items-center justify-center w-64 sm:w-56 md:w-60 h-36 p-3 border-1 border-gray-900 rounded-xl dark:border-neutral-400 hover:shadow-2xl dark:hover:bg-neutral-700 hover:bg-[var(--p-primary-300)] cursor-pointer transition-all duration-200">
    <component :is="IconComponentsSettings[icon]" class="w-10 h-10 md:w-12 md:h-12 dark:fill-neutral-300" />
    <small class="mt-2 text-center text-sm md:text-base text-gray-800 font-semibold dark:text-neutral-300">{{
      text
    }}</small>
  </div>
</template>
