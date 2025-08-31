<script lang="ts">
import {
  defineComponent,
  type FunctionalComponent,
  type PropType,
  ref,
} from 'vue'

import PrimeButton from 'primevue/button'

import BuyIcon from '@/assets/svg/header/buy.svg?component'
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
import InformationIcon from '@/assets/svg/table-actions/information.svg?component'
import ViewIcon from '@/assets/svg/table-actions/view.svg?component'
import AppBreadcrumb from '@/components/atoms/breadcrumb/AppBreadcrumb.vue'
import AppSearchInput from '@/components/atoms/inputs/AppSearchInput.vue'
import AppNotificationBell from '@/components/atoms/notifications/AppNotificationBell.vue'
import AppDarkMode from '@/components/molecules/dark-mode/AppDarkMode.vue'
import AppLanguage from '@/components/molecules/language/AppLanguage.vue'
import AppProfile from '@/components/molecules/profile/AppProfile.vue'

import { ActionTypes } from './enums/action-types.enum'
import { IconTypes } from './enums/icon-types.enum'

export const ActionIconComponents: Record<ActionTypes, FunctionalComponent> = {
  [ActionTypes.CREATE]: CreateIcon,
  [ActionTypes.EDIT]: EditIcon,
  [ActionTypes.DELETE]: DeleteIcon,
  [ActionTypes.EXPORT]: ExportIcon,
  [ActionTypes.IMPORT]: ImportIcon,
  [ActionTypes.VIEW]: ViewIcon,
  [ActionTypes.SEND]: SendIcon,
  [ActionTypes.BULK_SMS]: SendIcon,
}

export const IconComponents: Record<IconTypes, FunctionalComponent> = {
  [IconTypes.CONTACTS]: ContactsIcon,
  [IconTypes.CAMPAIGNS]: CampaignsIcon,
  [IconTypes.WHATSAPP]: ContactsIcon,
  [IconTypes.SEND]: SendIcon,
  [IconTypes.REPORTS]: ReportsIcon,
  [IconTypes.AUDIT]: AuditIcon,
  [IconTypes.MESSAGES]: MessagesIcon,
  [IconTypes.BUY]: BuyIcon,
  [IconTypes.SETTINGS]: SettingsIcon,
  [IconTypes.IMPORT]: ImportIcon,
  [IconTypes.CUSTOM_FIELDS]: InformationIcon,
}

export default defineComponent({
  components: {
    AppProfile,
    AppSearchInput,
    AppLanguage,
    AppBreadcrumb,
    AppDarkMode,
    AppNotificationBell,
    PrimeButton
  },
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
          icon?: string
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
    showHeader: {
      type: Boolean,
      default: true,
    },
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup() {
    const searchQuery = ref('')

    const getActionSeverity = (actionType: ActionTypes) => {
      return actionType === ActionTypes.DELETE ? 'danger' : undefined
    }

    const getActionSize = (): 'small' | 'large' | undefined => {
      return 'small'
    }

    return {
      searchQuery,
      ActionIconComponents,
      IconComponents,
      getActionSeverity,
      getActionSize,
    }
  },
})
</script>

<template>
  <div

    class="hidden md:flex md:justify-between md:items-center h-16 dark:border-gray-700 w-full pr-4 gap-4"
  >
    <AppBreadcrumb />
    <div class="flex items-center gap-2">
      <AppNotificationBell />
      <AppDarkMode />
      <AppLanguage />
      <AppProfile />
    </div>
  </div>

  <div
    class="flex flex-col sm:flex-row md:flex-nowrap items-center sm:h-16 dark:border-gray-700 w-full px-4"
    v-if="showHeader && (text || icon)"
  >
    <div class="flex flex-col items-center md:flex-row md:gap-4">
      <component
        :is="IconComponents[icon]"
        v-if="icon && IconComponents[icon]"
        class="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 dark:fill-[var(--p-primary-color)]"
      />
      <span class="text-xl font-semibold text-center md:text-left">
        {{ text }}
      </span>
    </div>

    <div
      class="flex flex-col sm:flex-row justify-center items-center gap-2 ml-auto w-full sm:w-auto"
    >
      <AppSearchInput
        v-if="showSearch"
        v-model:search="searchQuery"
        class="w-full md:w-auto"
        @update:search="$emit('update:modelValue', $event)"
        :placeholder="placeholder"
      />
      <div class="flex gap-2 mx-2">
        <PrimeButton
          v-for="(action, index) in actions"
          :key="index"
          v-tooltip.bottom="action.label"
          @click="action.onClick(selectedId)"
          :severity="getActionSeverity(action.type)"
          :size="getActionSize()"
          rounded
          class="!w-10 !h-10 flex-shrink-0"
        >
          <component
            :is="ActionIconComponents[action.type]"
            class="w-5 h-5"
          />
        </PrimeButton>
      </div>
    </div>
  </div>
</template>
