<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import DateIcon from '@/assets/svg/date.svg?component'
import DateSendIcon from '@/assets/svg/date_send.svg?component'
import MessageTypeIcon from '@/assets/svg/message_type.svg?component'
import NumberIcon from '@/assets/svg/number.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import SmsIcon from '@/assets/svg/sms.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppDateRangePicker from '@/components/atoms/datepickers/AppDateRangePicker.vue'
import AppHtmlViewerDialog from '@/components/atoms/dialogs/AppHtmlViewerDialog.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import AppFilterPanel from '@/components/molecules/filter-panel/AppFilterPanel.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useActiveFiltersCount } from '@/composables/useActiveFiltersCount'
import { useStatusColors } from '@/composables/useStatusColors'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'
// Interfaz para mensajes de reporte con contenido
interface IReportMessage {
  id: number
  content: string
  type: string
  status: string
  timestamp: Date
  createdAt: Date
  updatedAt: Date
  // Otras propiedades que pueda tener el mensaje
}
import { useReportService } from '@/services/report/useReportServices'

import { useMessageFilter } from './composables/useMessageFilter'
import { TypeMessageTypes } from './enums/message-types.enum.ts'
import { StatusMessageTypes } from './enums/status-types.enum'
export default defineComponent({
  name: 'MessagesPage',
  components: {
    AppHeader,
    AppTable,
    AppTag,
    AppHtmlViewerDialog,
    AppFilterPanel,
    AppInput,
    AppSelect,
    AppDateRangePicker,
    NumberIcon,
    MessageTypeIcon,
    DateSendIcon,
    StatusIcon,
    SmsIcon,
    SearchIcon,
    DateIcon,
  },
  setup() {
    const { t } = useI18n()
    const toast = useToast()
    const router = useRouter()
    const { getMessages, exportMessages } = useReportService()
    const { content, status, messageType, startDate, endDate } = useMessageFilter()
    const { activeFiltersCount } = useActiveFiltersCount({ content, status, messageType, startDate, endDate })
    const { getStatusSeverity } = useStatusColors()

    const showMobileModal = ref(false)

    const page = ref(1)
    const limit = ref(10)
    const messages = ref<IReportMessage[]>([])
    const messageMeta = ref<IPaginationMeta>({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 10,
      totalPages: 0,
      totalRecords: 0,
    })
    const loading = ref(false)
    const isHtmlViewerVisible = ref(false)
    const htmlContent = ref('')

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
          messages.value = response.data as unknown as IReportMessage[]
          messageMeta.value = response.meta
        } else {
        }
      } catch {
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
        label: t('actions.filter'),
        type: ActionTypes.FILTER,
        badge: activeFiltersCount.value > 0 ? activeFiltersCount.value : undefined,
        onClick: () => { showMobileModal.value = !showMobileModal.value },
      },
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

    const getStatusTranslation = (status: unknown) => {
      const statusString = typeof status === 'string' ? status : String(status)
      const translationKey = StatusMessageTypes[statusString as keyof typeof StatusMessageTypes]
      return translationKey ? t(translationKey) : statusString
    }
    const getTypeMessageTranslation = (type: unknown) => {
      const typeString = typeof type === 'string' ? type : String(type)
      // Manejar los tipos específicos de contenido
      if (typeString === 'plain_text') {
        return t('general.sms')
      }
      if (typeString === 'html') {
        return t('general.email_channel')
      }

      // Fallback para otros tipos usando el enum existente
      const translationKey = TypeMessageTypes[typeString as keyof typeof TypeMessageTypes]
      return translationKey ? t(translationKey) : typeString
    }

    const handleViewHtmlContent = (messageData: Record<string, unknown>) => {
      const message = messageData as unknown as IReportMessage
      htmlContent.value = message.content
      isHtmlViewerVisible.value = true
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
      getStatusSeverity,
      loading,
      isHtmlViewerVisible,
      htmlContent,
      handleViewHtmlContent,
      StatusMessageTypes,
      TypeMessageTypes,
      showMobileModal,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.MESSAGES" :text="$t('general.messages')" :actions="headerActions" />

  <AppFilterPanel
    :header-actions="headerActions"
    v-model:showMobileModal="showMobileModal"
  >
    <AppInput
      :modelValue="content"
      type="text"
      class="w-full"
      :label="$t('general.search')"
      @input="content = $event.target.value"
    >
      <template #icon>
        <SearchIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>

    <AppSelect
      class="w-full"
      :modelValue="status"
      :options="
        Object.entries(StatusMessageTypes).map(([key, value]) => ({
          value: key,
          name: $t(value),
        }))
      "
      :label="$t('general.status')"
      @update:modelValue="status = $event as string"
    >
      <template #icon>
        <StatusIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppSelect>

    <AppSelect
      class="w-full"
      :modelValue="messageType"
      :options="
        Object.entries(TypeMessageTypes).map(([key, value]) => ({
          value: key,
          name: $t(value),
        }))
      "
      :label="$t('general.message_type')"
      @update:modelValue="messageType = $event as string"
    >
      <template #icon>
        <MessageTypeIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppSelect>

    <AppDateRangePicker
      class="w-full col-span-1 sm:col-span-2"
      :startDate="startDateString"
      :endDate="endDateString"
      :startLabel="$t('general.start_date')"
      :endLabel="$t('general.end_date')"
      @update:startDate="startDateString = $event"
      @update:endDate="endDateString = $event"
    >
      <template #icon>
        <DateIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppDateRangePicker>
  </AppFilterPanel>
  <AppTable
    class="w-full mt-4"
    :data="messages"
    :headers="[
      { field: 'sentAt', header: 'Date' },
      { field: 'recipientDetails', header: 'Number' },
      { field: 'contentType', header: 'Type' },
      { field: 'content', header: 'Content' },
      { field: 'status', header: 'Status' },
      { field: 'actions', header: 'Actions' },
    ]"
    :pageSize="messageMeta.limit"
    :pageCurrent="messageMeta.currentPage"
    :totalItems="messageMeta.totalRecords"
    :multipleSelection="false"
    :loading="loading"
    textTotalItems="general.messages"
    @page-change="fetchMessages"
  >
    <template #header-recipientDetails>
      <div class="flex items-center">
        <NumberIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.recipient_details') }} </span>
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
    <template #custom-contentType="{ data }">
      <div class="flex justify-center">
        {{ getTypeMessageTranslation(data.contentType) }}
      </div>
    </template>
    <template #custom-content="{ data }">
      <div class="flex justify-center">
        <div
          v-if="data.contentType === 'html'"
          class="line-clamp-1 max-w-[200px] cursor-pointer"
          v-html="data.content"
        ></div>
        <span
          v-else
          v-tooltip.left="data.content"
          class="line-clamp-1 max-w-[200px] cursor-pointer"
          :title="String(data.content || '')"
        >
          {{ data.content || '' }}
        </span>
      </div>
    </template>
    <template #custom-status="{ data }">
      <div class="flex justify-center">
        <AppTag
          :label="$t(`status.message.${String(data.status || 'failed')}`)"
          :severity="getStatusSeverity(String(data.status || 'failed'), 'message')"
        />
      </div>
    </template>
    <template #custom-actions="{ data }">
      <div class="flex justify-center">
         <div
          v-if="data.contentType === 'html'"
          class="flex items-center justify-center w-6 h-6 rounded-full border-gray-400 border"
           @click="handleViewHtmlContent(data)"
        >
          <i class="pi pi-eye"></i>
        </div>
        <small v-else>--</small>

      </div>
    </template>
  </AppTable>

  <!-- Modal para visualizar contenido HTML -->
  <AppHtmlViewerDialog
    v-model:visible="isHtmlViewerVisible"
    :html-content="htmlContent"
  />
</template>

<style scoped lang="scss">
// Estilos para el contenido HTML en la tabla
:deep(.line-clamp-1) {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  // Estilos para elementos HTML dentro del contenido
  p, div, span {
    display: inline;
    margin: 0;
    padding: 0;
  }

  // Limitar el estilo de elementos de formato
  b, strong {
    font-weight: 600;
  }

  i, em {
    font-style: italic;
  }

  u {
    text-decoration: underline;
  }

  // Ocultar enlaces para evitar problemas en la tabla
  a {
    color: inherit;
    text-decoration: none;
  }

  // Ocultar imágenes en la vista de tabla
  img {
    display: none;
  }

  // Evitar que los elementos interactivos interfieran
  button, a, input {
    pointer-events: none;
  }
}
</style>
