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
        <div class="space-y-1.5">
          <div
            v-for="item in slotProps.items"
            :key="item.id"
            class="bg-white dark:bg-neutral-900 rounded-lg p-1.5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-center justify-between gap-2">
              <!-- Información principal en una línea -->
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div class="flex items-center gap-1 text-xs text-neutral-500">
                  <i class="pi pi-phone"></i>
                  <span class="text-neutral-600 dark:text-neutral-100">{{ item.phone }}</span>
                </div>
                <div class="flex items-center gap-1 text-xs text-neutral-500">
                  <i class="pi pi-calendar"></i>
                  <span class="text-neutral-600 dark:text-neutral-100">{{ formatDate(item.createdAt) }}</span>
                </div>
                <span class="text-xs text-neutral-600 dark:text-neutral-100 truncate" :title="item.content">
                  {{ truncateText(item.content, 50) }}
                </span>
              </div>

              <!-- Estado y botón de vista -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <AppTag
                  :label="$t(`status.message.${item.status}`)"
                  :severity="getStatusSeverity(item.status, 'message')"
                  size="small"
                />
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


