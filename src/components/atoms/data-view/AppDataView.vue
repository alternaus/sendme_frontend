<template>
  <div class="w-full">
    <DataView
      v-if="data.length > 0"
      :value="data"
      :paginator="false"
      :rows="10"
      layout="list"
      class="compact-data-view"
    >
            <template #list="slotProps">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div
            v-for="item in slotProps.items"
            :key="item.id"
            class="bg-neutral-60 dark:bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
          >
            <!-- Header con nombre de campaña y estado -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <span class="text-sm font-semibold text-neutral-700 dark:text-neutral-800 truncate flex-1">
                {{ item.campaignName }}
              </span>
              <AppTag
                :label="$t(`status.message.${item.status}`)"
                :severity="getStatusSeverity(item.status, 'message')"
                size="small"
              />
            </div>

            <!-- Información de contacto y fecha -->
            <div class="space-y-1 mb-3">
              <div class="flex items-center gap-2 text-xs text-neutral-500">
                <i class="pi pi-phone flex-shrink-0"></i>
                <span class="text-neutral-600 dark:text-neutral-600 truncate">{{ item.phone }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-neutral-500">
                <i class="pi pi-calendar flex-shrink-0"></i>
                <span class="text-neutral-600 dark:text-neutral-600">{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>

            <!-- Contenido del mensaje -->
            <div class="flex-1">
              <span class="text-xs text-neutral-600 dark:text-neutral-600 leading-relaxed block" :title="item.content">
                {{ truncateText(item.content, 80) }}
              </span>
            </div>

            <!-- Botón de vista -->
            <div class="flex justify-end mt-2">
              <button
                @click="$emit('view-content', item.content)"
                class="p-1 bg-transparent border-none rounded text-primary-color hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-all duration-200 active:scale-95"
                :title="$t('general.view_content')"
              >
                <i class="pi pi-eye text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center justify-center py-6 text-neutral-400">
          <i class="pi pi-inbox text-xl"></i>
          <p class="text-sm text-neutral-500 mt-2">{{ emptyMessage?? t('general.no_data') }}</p>
        </div>
      </template>
    </DataView>
  </div>
</template>

<script setup lang="ts">

import DataView from 'primevue/dataview'

import { useI18n } from 'vue-i18n'

import AppTag from '@/components/atoms/tag/AppTag.vue'
import { useDateFormat } from '@/composables/useDateFormat'
import { useStatusColors } from '@/composables/useStatusColors'

interface Props {
  data: Array<{
    id: number
    status: string
    createdAt: string
    campaignName: string
    phone: string
    content: string
  }>
  emptyMessage?: string
}
const { t } = useI18n()
withDefaults(defineProps<Props>(), {
  emptyMessage: ''
})

defineEmits<{
  'view-content': [content: string]
}>()


const { getStatusSeverity } = useStatusColors()
const { formatDate } = useDateFormat()

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>


