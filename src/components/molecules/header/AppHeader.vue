<script lang="ts">
import {
  defineComponent,
  type FunctionalComponent,
  type PropType,
  ref,
  type SVGAttributes,
} from 'vue'

import CampaignsIcon from '@/assets/svg/header/campaigns.svg?component'
import ContactsIcon from '@/assets/svg/header/contacts.svg?component'
import CreateIcon from '@/assets/svg/table-actions/create.svg?component'
import DeleteIcon from '@/assets/svg/table-actions/delete.svg?component'
import EditIcon from '@/assets/svg/table-actions/edit.svg?component'
import ExportIcon from '@/assets/svg/table-actions/export.svg?component'
import ImportIcon from '@/assets/svg/table-actions/import.svg?component'
import AppSearchInput from '@/components/atoms/inputs/AppSearchInput.vue'
import AppProfile from '@/components/molecules/profile/AppProfile.vue'

import { ActionTypes } from './enums/action-types.enum'
import { IconTypes } from './enums/icon-types.enum'

export const ActionIcons: Record<ActionTypes, FunctionalComponent<SVGAttributes>> = {
  [ActionTypes.CREATE]: CreateIcon,
  [ActionTypes.EDIT]: EditIcon,
  [ActionTypes.DELETE]: DeleteIcon,
  [ActionTypes.EXPORT]: ExportIcon,
  [ActionTypes.IMPORT]: ImportIcon,
}

export const IconComponents: Record<IconTypes, FunctionalComponent> = {
  [IconTypes.CONTACTS]: ContactsIcon,
  [IconTypes.CAMPAIGNS]: CampaignsIcon,
  [IconTypes.WHATSAPP]: ContactsIcon,
  [IconTypes.SEND]: ContactsIcon,
  [IconTypes.REPORTS]: ContactsIcon,
  [IconTypes.BUY]: ContactsIcon,
  [IconTypes.SETTINGS]: ContactsIcon,
}

export default defineComponent({
  components: { AppProfile, AppSearchInput },
  props: {
    icon: {
      type: String as PropType<keyof typeof IconTypes>,
      required: true,
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
      required: true,
    },
    selectedId: {
      type: Number,
      default: null,
    },
  },
  setup() {
    const searchQuery = ref('')

    const getActionClass = (actionType: ActionTypes) => {
      return actionType === ActionTypes.DELETE
        ? 'bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-700'
        : 'bg-[var(--p-primary-color)] hover:bg-primary-400 '
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
  <div class="flex items-center h-16 dark:border-gray-700 w-full">
    <component
      :is="IconComponents[icon]"
      class="w-12 h-12 ml-4 dark:fill-[var(--p-primary-color)]"
    />

    <div class="flex items-center gap-2 ml-auto mx-4">
      <AppSearchInput
        :search="searchQuery"
        class="w-full"
        @update:search="searchQuery = $event"
        :placeholder="placeholder"
      />
      <button
        v-for="(action, index) in actions"
        :key="index"
        v-tooltip.bottom="action.label"
        @click="action.onClick(selectedId)"
        :class="`p-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getActionClass(action.type)}`"
      >
        <component :is="ActionIcons[action.type]" class="w-6 h-6" />
      </button>
    </div>

    <AppProfile />
  </div>
</template>
