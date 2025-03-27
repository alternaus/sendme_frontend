<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'
import type { IMessage } from '@/services/report/interfaces/message.interface'
import { useReportService } from '@/services/report/useReportServices'
export default defineComponent({
  name: 'MessagesPage',
  components: {
    AppHeader,
    AppTable,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const toast = useToast()
    const { getMessages } = useReportService()

    const page = ref(1)
    const limit = ref(10)
    const messages = ref<IMessage[]>([])
    const messageMeta = ref<IPaginationMeta>({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 10,
      totalPages: 0,
      totalRecords: 0,
    })
    const fetchMessages = async ({ pageSize = 1, limitSize = 10 } = {}) => {
      page.value = pageSize
      limit.value = limitSize
      try {
        const response = await getMessages({
          page: pageSize,
          limit: limitSize,
        })
        messages.value = response.data
        messageMeta.value = response.meta
      } catch (error) {
        console.error('❌ Error al obtener mensajes:', error)
      }
    }

    const headerActions = computed(() => [
      {
        label: t('actions.export'),
        type: ActionTypes.EXPORT,
        onClick: () => {
          try {
            toast.add({
              severity: 'success',
              summary: t('general.success'),
              detail: t('report.messages_success_exported'),
              life: 3000,
            })
          } catch (error) {
            console.error('❌ Error al exportar mensajes:', error)
            toast.add({
              severity: 'error',
              summary: t('general.error'),
              detail: t('report.messages_error_exported'),
              life: 3000,
            })
          }
        },
      },
    ])

    onMounted(() => fetchMessages())

    return {
      router,
      headerActions,
      IconTypes,
      messageMeta,
      messages,
      fetchMessages,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.MESSAGES" :text="$t('general.messages')" :actions="headerActions" />
  <!-- {{ messages  }} -->
  <AppTable
    class="w-full mt-4"
    :data="messages"
    :headers="[
      { field: 'createdAt', header: 'Date' },
      { field: 'recipientDetails', header: 'Number' },
      { field: 'messageType', header: 'Type' },
      { field: 'content', header: 'Content' },
      { field: 'status', header: 'Status' },
    ]"
    :pageSize="messageMeta.limit"
    :pageCurrent="messageMeta.currentPage"
    :totalItems="messageMeta.totalRecords"
    :multipleSelection="false"
    textTotalItems="general.messages"
    @page-change="fetchMessages"
  >
  </AppTable>
</template>
