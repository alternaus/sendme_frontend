<script lang="ts">
import { defineComponent, type FunctionalComponent, type PropType } from 'vue'

import AdministratorsIcon from '@/assets/svg/administrators.svg?component'
import IntegrationsIcon from '@/assets/svg/integrations.svg?component'
import InformationIcon from '@/assets/svg/table-actions/information.svg?component'

import { IconTypesSettings } from './enums/icon-types-settings.enum'



// Map de iconos
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
    class="flex flex-col items-center justify-center w-48 h-38 p-4 border-3 border-gray-900 rounded-md dark:border-white hover:shadow-2xl dark:hover:bg-neutral-700 hover:bg-[var(--p-primary-color)] cursor-pointer">
    <component :is="IconComponentsSettings[icon]" class="w-12 h-12 dark:fill-white" />
    <small class="mt-3 text-center text-base text-gray-800 font-semibold dark:text-white">{{
      text
    }}</small>
  </div>
</template>
