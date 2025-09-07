<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import CampaignRouteIcon from '@/assets/svg/campaign_route.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import DateSendIcon from '@/assets/svg/date_send.svg?component'
import NumberIcon from '@/assets/svg/number.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import AppDateRangePicker from '@/components/atoms/datepickers/AppDateRangePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppFilterPanel from '@/components/molecules/filter-panel/AppFilterPanel.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useActiveFiltersCount } from '@/composables/useActiveFiltersCount'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'
import type { ICampaignDispatch } from '@/services/report/interfaces/dispatch.interface'
import { useReportService } from '@/services/report/useReportServices'

import { useDispatchFilter } from './composables/useDispatchFilter'
import { DispatchStatusTypes } from './enums/dispatch-status.enum'

export default defineComponent({
  name: 'DispatchesPage',
  components: {
    AppHeader,
    AppTable,
    AppFilterPanel,
    AppInput,
    AppDateRangePicker,
    NumberIcon,
    DateSendIcon,
    CampaignRouteIcon,
    SearchIcon,
    DateIcon,
  },
  setup() {
    const { t } = useI18n()
    const toast = useToast()
    const router = useRouter()
    const { getDispatches, exportDispatches } = useReportService()
    const { search, startDate, endDate } = useDispatchFilter()
    const { activeFiltersCount } = useActiveFiltersCount({ search, startDate, endDate })

    const showMobileModal = ref(false)

    const page = ref(1)
    const limit = ref(10)
    const dispatches = ref<ICampaignDispatch[]>([])
    const dispatchMeta = ref<IPaginationMeta>({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 10,
      totalPages: 0,
      totalRecords: 0,
    })
    const loading = ref(false)

    watch([search, startDate, endDate], () => {
      fetchDispatches()
    })

    const fetchDispatches = async ({ pageSize = 1, limitSize = 10 } = {}) => {
      page.value = pageSize
      limit.value = limitSize
      loading.value = true
      try {
        const response = await getDispatches({
          page: pageSize,
          limit: limitSize,
          search: search.value,
          startDate: startDate.value?.toISOString(),
          endDate: endDate.value?.toISOString(),
        })

        if (response?.data && response?.meta) {
          // Agregar campos calculados para mostrar en la tabla
          dispatches.value = response.data.map(dispatch => ({
            ...dispatch,
            campaignName: dispatch.campaign.name,
            providerName: dispatch.provider.name,
            recipientDetails: '-' // No hay datos de destinatario en esta estructura
          }))
          dispatchMeta.value = response.meta
        }
      } catch {
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('reports.error_getting_dispatches'),
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
          exportDispatches({
            search: search.value,
            startDate: startDate.value?.toISOString(),
            endDate: endDate.value?.toISOString(),
          })
        },
      },
    ])

    onMounted(() => fetchDispatches())

    const getStatusTranslation = (status: string) => {
      const translationKey = DispatchStatusTypes[status as keyof typeof DispatchStatusTypes]
      return translationKey ? t(translationKey) : status
    }

    const getStatusBadgeClass = (status: string) => {
      const classes = {
        delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        scheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      }
      return classes[status as keyof typeof classes] || classes.pending
    }

    const formatDate = (dateString?: unknown) => {
      if (!dateString) return '-'
      const dateStr = typeof dateString === 'string' ? dateString : String(dateString)
      return new Date(dateStr).toLocaleString()
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
      dispatchMeta,
      dispatches,
      fetchDispatches,
      search,
      startDateString,
      endDateString,
      getStatusTranslation,
      getStatusBadgeClass,
      formatDate,
      loading,
      showMobileModal,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.CAMPAIGNS" :text="$t('reports.sending_by_campaign')" :actions="headerActions" />

  <AppFilterPanel
    :header-actions="headerActions"
    v-model:showMobileModal="showMobileModal"
  >
    <AppInput
      :modelValue="search"
      type="text"
      class="w-full"
      :label="$t('common.general.search')"
      @input="search = $event.target.value"
    >
      <template #icon>
        <SearchIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>

    <AppDateRangePicker
      class="w-full"
      :startDate="startDateString"
      :endDate="endDateString"
      :startLabel="$t('common.general.start_date')"
      :endLabel="$t('common.general.end_date')"
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
    :data="dispatches"
    :headers="[
      { field: 'campaignName', header: 'Campaign' },
      { field: 'providerName', header: 'Provider' },
      { field: 'totalSent', header: 'Total Sent' },
      { field: 'totalDelivered', header: 'Total Delivered' },
      { field: 'totalFailed', header: 'Total Failed' },
      { field: 'sentAt', header: 'Sent Date' },
    ]"
    :pageSize="dispatchMeta.limit"
    :pageCurrent="dispatchMeta.currentPage"
    :totalItems="dispatchMeta.totalRecords"
    :multipleSelection="false"
    :loading="loading"
    textTotalItems="general.dispatches"
    @page-change="fetchDispatches"
  >
    <template #header-campaignName>
      <div class="flex items-center">
        <CampaignRouteIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('common.general.campaign') }} </span>
      </div>
    </template>
    <template #header-providerName>
      <div class="flex items-center">
        <NumberIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('common.general.provider') }} </span>
      </div>
    </template>
    <template #header-totalSent>
      <div class="flex items-center">
        <NumberIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('common.general.total_sent') }} </span>
      </div>
    </template>
    <template #header-totalDelivered>
      <div class="flex items-center">
        <NumberIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('common.general.total_delivered') }} </span>
      </div>
    </template>
    <template #header-totalFailed>
      <div class="flex items-center">
        <NumberIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('common.general.total_failed') }} </span>
      </div>
    </template>
    <template #header-sentAt>
      <div class="flex items-center">
        <DateSendIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('common.general.shipment_date') }} </span>
      </div>
    </template>

    <template #custom-campaignName="{ data }">
      <div class="flex justify-center">
        <span
          v-tooltip.left="data.campaignName"
          class="line-clamp-1 max-w-[150px]"
          :title="String(data.campaignName || '')"
        >
          {{ data.campaignName || '' }}
        </span>
      </div>
    </template>

    <template #custom-providerName="{ data }">
      <div class="flex justify-center">
        <span
          v-tooltip.left="data.providerName"
          class="line-clamp-1 max-w-[150px]"
          :title="String(data.providerName || '')"
        >
          {{ data.providerName || '' }}
        </span>
      </div>
    </template>

    <template #custom-totalSent="{ data }">
      <div class="flex justify-center">
        <span class="text-sm font-medium">
          {{ data.totalSent || 0 }}
        </span>
      </div>
    </template>

    <template #custom-totalDelivered="{ data }">
      <div class="flex justify-center">
        <span class="text-sm font-medium text-green-600">
          {{ data.totalDelivered || 0 }}
        </span>
      </div>
    </template>

    <template #custom-totalFailed="{ data }">
      <div class="flex justify-center">
        <span class="text-sm font-medium text-red-600">
          {{ data.totalFailed || 0 }}
        </span>
      </div>
    </template>

    <template #custom-sentAt="{ data }">
      <div class="flex justify-center">
        {{ formatDate(data.sentAt) }}
      </div>
    </template>
  </AppTable>
</template>

<style scoped lang="scss">
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
