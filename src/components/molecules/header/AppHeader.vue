<script lang="ts">
import {
  defineComponent,
  type FunctionalComponent,
  type PropType,
  ref,
  type SVGAttributes,
} from 'vue'

import EyeIcon from '@/assets/svg/eye.svg?component'
import CampaignsIcon from '@/assets/svg/header/campaigns.svg?component'
import ContactsIcon from '@/assets/svg/header/contacts.svg?component'
import ReportsIcon from '@/assets/svg/header/reports.svg?component'
import SendIcon from '@/assets/svg/header/send.svg?component'
import SettingsIcon from '@/assets/svg/header/settings.svg?component'
import AuditIcon from '@/assets/svg/report/audit.svg?component'
import MessagesIcon from '@/assets/svg/report/messages.svg?component'
import CreateIcon from '@/assets/svg/table-actions/create.svg?component'
import DeleteIcon from '@/assets/svg/table-actions/delete.svg?component'
import EditIcon from '@/assets/svg/table-actions/edit.svg?component'
import ExportIcon from '@/assets/svg/table-actions/export.svg?component'
import ImportIcon from '@/assets/svg/table-actions/import.svg?component'
import AppBreadcrumb from '@/components/atoms/breadcrumb/AppBreadcrumb.vue'
import AppSearchInput from '@/components/atoms/inputs/AppSearchInput.vue'
import AppDarkMode from '@/components/molecules/dark-mode/AppDarkMode.vue'
import AppLanguage from '@/components/molecules/language/AppLanguage.vue'
import AppProfile from '@/components/molecules/profile/AppProfile.vue'

import { ActionTypes } from './enums/action-types.enum'
import { IconTypes } from './enums/icon-types.enum'

export const ActionIcons: Record<ActionTypes, FunctionalComponent<SVGAttributes>> = {
  [ActionTypes.CREATE]: CreateIcon,
  [ActionTypes.EDIT]: EditIcon,
  [ActionTypes.DELETE]: DeleteIcon,
  [ActionTypes.EXPORT]: ExportIcon,
  [ActionTypes.IMPORT]: ImportIcon,
  [ActionTypes.VIEW]: EyeIcon,
}

export const IconComponents: Record<IconTypes, FunctionalComponent> = {
  [IconTypes.CONTACTS]: ContactsIcon,
  [IconTypes.CAMPAIGNS]: CampaignsIcon,
  [IconTypes.WHATSAPP]: ContactsIcon,
  [IconTypes.SEND]: SendIcon,
  [IconTypes.REPORTS]: ReportsIcon,
  [IconTypes.AUDIT]: AuditIcon,
  [IconTypes.MESSAGES]: MessagesIcon,
  [IconTypes.BUY]: ContactsIcon,
  [IconTypes.SETTINGS]: SettingsIcon,
  [IconTypes.IMPORT]: ImportIcon,
}

export default defineComponent({
  components: { AppProfile, AppSearchInput, AppLanguage, AppBreadcrumb, AppDarkMode },
  props: {
    icon: {
      type: String as PropType<keyof typeof IconTypes>,
      required: false,
    },
    placeholder: {
      type: String,
      default: 'Buscar...',
    },
    actions: {
      type: Array as PropType<
        Array<{
          type: ActionTypes
          label: string
          onClick: (id?: number) => void
        }>
      >,
      required: false,
    },
    selectedId: {
      type: Number,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup() {
    const searchQuery = ref('')

    const getActionClass = (actionType: ActionTypes) => {
      return actionType === ActionTypes.DELETE
        ? 'bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-700'
        : 'bg-[var(--p-primary-color)] hover:bg-yellow-400 text-black'
    }

    return {
      searchQuery,
      ActionIcons,
      IconComponents,
      getActionClass,
    }
  },
})
</script>

<template>
  <div class="hidden md:flex md:justify-between md:items-center h-16 dark:border-gray-700 w-full pr-4 gap-4">
    <AppBreadcrumb />
    <div class="flex items-center gap-2">

      <AppDarkMode />
      <AppLanguage />
      <AppProfile />
    </div>
  </div>

  <div class="flex flex-wrap md:flex-nowrap items-center h-16 dark:border-gray-700 w-full px-4">
    <div class="flex flex-col items-center md:flex-row md:gap-4">
      <component :is="IconComponents[icon]"
        class="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 dark:fill-[var(--p-primary-color)]" />
      <span class="text-xl  font-semibold text-center md:text-left">
        {{ text }}
      </span>
    </div>

    <div class="flex items-center gap-2 ml-auto">
      <AppSearchInput v-if="showSearch" :search="searchQuery" class="w-full md:w-auto"
        @update:search="searchQuery = $event" :placeholder="placeholder" />
      <div class="flex gap-2 mx-2">
        <button v-for="(action, index) in actions" :key="index" v-tooltip.bottom="action.label"
          @click="action.onClick(selectedId)"
          :class="`p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed, cursor-pointer ${getActionClass(action.type)}`">
          <component :is="ActionIcons[action.type]" class="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
        </button>
      </div>
    </div>
  </div>
</template>
