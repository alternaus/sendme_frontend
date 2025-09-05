<script setup lang="ts">
import { type FunctionalComponent } from 'vue'

import { useI18n } from 'vue-i18n'

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
import AppButton from '@/components/atoms/buttons/AppButton.vue'

import { ActionTypes } from './enums/action-types.enum'
import { IconTypes } from './enums/icon-types.enum'

interface Props {
  icon?: keyof typeof IconTypes
  placeholder?: string
  actions?: Array<{
    type: ActionTypes
    label: string
    onClick: (id?: number) => void
    icon?: string
  }>
  selectedId?: number | null
  text?: string | null
  title?: string
  selectedItems?: number
  showSearch?: boolean
  showHeader?: boolean
  modelValue?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar...',
  selectedId: null,
  text: null,
  selectedItems: 0,
  showSearch: false,
  showHeader: true,
  modelValue: '',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

const ActionIconComponents: Record<ActionTypes, FunctionalComponent> = {
  [ActionTypes.CREATE]: CreateIcon,
  [ActionTypes.EDIT]: EditIcon,
  [ActionTypes.DELETE]: DeleteIcon,
  [ActionTypes.EXPORT]: ExportIcon,
  [ActionTypes.IMPORT]: ImportIcon,
  [ActionTypes.VIEW]: ViewIcon,
  [ActionTypes.SEND]: SendIcon,
  [ActionTypes.BULK_SMS]: SendIcon,
}

const IconComponents: Record<IconTypes, FunctionalComponent> = {
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


const getActionSeverity = (actionType: ActionTypes) => {
  return actionType === ActionTypes.DELETE ? 'danger' : undefined
}

const getActionSize = (): 'small' | 'large' | undefined => {
  return 'small'
}
</script>



<template>
  <div
    class="flex flex-row justify-between items-center mb-2 h-12 dark:border-gray-700 w-full px-4 gap-2"
    v-if="showHeader && (text || title || icon)"
  >
    <div class="flex items-center gap-2 flex-shrink-0">
      <component
        :is="IconComponents[icon]"
        v-if="icon && IconComponents[icon]"
        class="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 dark:fill-[var(--p-primary-color)]"
      />
      <div class="hidden md:flex md:flex-row md:items-center md:gap-2">
        <span class="text-xl font-semibold dark:text-[var(--p-primary-color)]">
          {{ title || text }}
        </span>
        <span
          v-if="selectedItems > 0"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          ({{ selectedItems }} {{ t('general.selected', selectedItems) }})
        </span>
      </div>
    </div>

    <div class="flex items-center gap-1 md:gap-2">
      <AppButton
        v-for="(action, index) in actions"
        :key="index"
        v-tooltip.bottom="action.label"
        @click="action.onClick(selectedId ?? undefined)"
        :severity="getActionSeverity(action.type)"
        :size="getActionSize()"
        rounded
        class="!w-8 !h-8 md:!w-10 md:!h-10 !p-1 md:!p-2 flex-shrink-0 flex items-center justify-center"
      >
        <component
          :is="ActionIconComponents[action.type]"
          class="w-5 h-5 md:w-6 md:h-6"
        />
      </AppButton>
    </div>
  </div>
</template>
