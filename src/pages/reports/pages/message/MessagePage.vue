<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import DateSendIcon from '@/assets/svg/date_send.svg?component'
import MessageTypeIcon from '@/assets/svg/message_type.svg?component'
import NumberIcon from '@/assets/svg/number.svg?component'
import SmsIcon from '@/assets/svg/sms.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
// import UserIcon from '@/assets/svg/user.svg?component'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'
import type { IMessage } from '@/services/report/interfaces/message.interface'
import { useReportService } from '@/services/report/useReportServices'

import CardFilterMessages from './components/CardFilterMessages.vue'
import { useMessageFilter } from './composables/useMessageFilter'
import { TypeMessageTypes } from './enums/message-types.enum.ts'
import { StatusMessageTypes } from './enums/status-types.enum'
export default defineComponent({
  name: 'MessagesPage',
  components: {
    AppHeader,
    AppTable,
    NumberIcon,
    MessageTypeIcon,
    DateSendIcon,
    StatusIcon,
    SmsIcon,
    CardFilterMessages,
    // UserIcon,
  },
  setup() {
    const { t } = useI18n()
    const toast = useToast()
    const router = useRouter()
    const { getMessages, exportMessages } = useReportService()
    const { content, status, messageType, startDate, endDate } = useMessageFilter()

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
    const loading = ref(false)
    watch([content, status, messageType, startDate, endDate], () => {
      fetchMessages()
    })
    const fetchMessages = async ({ pageSize = 1, limitSize = 10 } = {}) => {
      page.value = pageSize
      limit.value = limitSize
      loading.value = true
      try {
        const response = await getMessages({
          page: pageSize,
          limit: limitSize,
          content: content.value,
          status: status.value,
          messageType: messageType.value,
          startDate: startDate.value?.toISOString(),
          endDate: endDate.value?.toISOString(),
        })
        if (response?.data && response?.meta) {
          messages.value = response.data
          messageMeta.value = response.meta
        } else {
          console.warn('⚠️ Respuesta no válida:', response)
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('report.error_getting_messages'),
        })
      } finally {
        loading.value = false
      }
    }

    const headerActions = computed(() => [
      {
        label: t('actions.export'),
        type: ActionTypes.EXPORT,
        onClick: () => {

            exportMessages({
              content: content.value,
              status: status.value,
              messageType: messageType.value,
              startDate: startDate.value?.toISOString(),
              endDate: endDate.value?.toISOString(),
            })
        },
      },
    ])

    onMounted(() => fetchMessages())

    const getStatusTranslation = (status: string) => {
      const translationKey = StatusMessageTypes[status as keyof typeof StatusMessageTypes]
      return translationKey ? t(translationKey) : status
    }
    const getTypeMessageTranslation = (type: string) => {
      const translationKey = TypeMessageTypes[type as keyof typeof TypeMessageTypes]
      return translationKey ? t(translationKey) : type
    }

    const startDateString = computed({
      get: () => startDate.value?.toISOString() || '',
      set: (value: string) => {
        startDate.value = value ? new Date(value) : new Date()
      }
    })

    const endDateString = computed({
      get: () => endDate.value?.toISOString() || '',
      set: (value: string) => {
        endDate.value = value ? new Date(value) : new Date()
      }
    })

    return {
      router,
      headerActions,
      IconTypes,
      messageMeta,
      messages,
      fetchMessages,
      content,
      status,
      messageType,
      startDateString,
      endDateString,
      getStatusTranslation,
      getTypeMessageTranslation,
      loading,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.MESSAGES" :text="$t('general.messages')" :actions="headerActions" />
  <CardFilterMessages
    v-model:content="content"
    v-model:status="status"
    v-model:messageType="messageType"
    v-model:startDate="startDateString"
    v-model:endDate="endDateString"
  />
  <AppTable
    class="w-full mt-4"
    :data="messages"
    :headers="[
      { field: 'sentAt', header: 'Date' },
      { field: 'recipientDetails', header: 'Number' },
      { field: 'messageType', header: 'Type' },
      { field: 'content', header: 'Content' },
      { field: 'status', header: 'Status' },
    ]"
    :pageSize="messageMeta.limit"
    :pageCurrent="messageMeta.currentPage"
    :totalItems="messageMeta.totalRecords"
    :multipleSelection="false"
    :loading="loading"
    :emptyMessage="'report.error_getting_messages'"
    textTotalItems="general.messages"
    @page-change="fetchMessages"
  >
    <template #header-recipientDetails>
      <div class="flex items-center">
        <NumberIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.recipient_details') }} </span>
      </div>
    </template>
    <template #empty>
      <div class="flex flex-col items-center justify-center p-6 text-center">
        <i class="pi pi-inbox text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <p class="text-gray-500 dark:text-gray-400">{{ $t('report.error_getting_messages') }}</p>
        <button
          @click="fetchMessages()"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <i class="pi pi-refresh mr-2"></i>
          {{ $t('general.retry') }}
        </button>
      </div>
    </template>
    <template #header-sentAt>
      <div class="flex items-center">
        <DateSendIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.shipment_date') }} </span>
      </div>
    </template>
    <template #header-messageType>
      <div class="flex items-center">
        <MessageTypeIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.message_type') }} </span>
      </div>
    </template>
    <template #header-content>
      <div class="flex items-center">
        <SmsIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.content') }} </span>
      </div>
    </template>
    <template #header-status>
      <div class="flex items-center">
        <StatusIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.status') }} </span>
      </div>
    </template>
    <template #custom-messageType="{ data }">
      <div class="flex justify-center">
        {{ getTypeMessageTranslation(data.messageType) }}
      </div>
    </template>
    <template #custom-content="{ data }">
      <div class="flex justify-center">
        <span
          v-tooltip.left="data.content"
          class="line-clamp-1 max-w-[200px] cursor-pointer"
          :title="data.content"
        >
          {{ data.content }}
        </span>
      </div>
    </template>
    <template #custom-status="{ data }">
      <div class="flex justify-center">
        {{ getStatusTranslation(data.status) }}
      </div>
    </template>
  </AppTable>
</template>
