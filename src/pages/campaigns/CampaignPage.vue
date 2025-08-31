<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import ChannelIcon from '@/assets/svg/channel.svg?component'
import CredentialIcon from '@/assets/svg/credential.svg?component'
import DateEndIcon from '@/assets/svg/date_end.svg?component'
import DateStartIcon from '@/assets/svg/date_start.svg?component'
import ModuleIcon from '@/assets/svg/module.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { ICampaign } from '@/services/campaign/interfaces/campaign.interface'
import type { ITestCampaignRequest, ITestCampaignResponse } from '@/services/campaign/interfaces/test-rules.interface'
import { useCampaignService } from '@/services/campaign/useCampaignService'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'

import CardFilterCampaigns from './components/CardFilterCampaigns.vue'
import TestResultsModal from './components/TestResultsModal.vue'
import { useCampaignFilter } from './composables/useCampaignFilter'

const { t } = useI18n()
const { push } = useRouter()
const { getCampaigns, deleteCampaign, testCampaign } = useCampaignService()
const { search, name, status, channelId, dateRange } = useCampaignFilter()
const toast = useToast()

const page = ref(1)
const limit = ref(10)
const campaigns = ref<ICampaign[]>([])
const selected = ref<ICampaign | null>(null)
const loading = ref(false)
const testingRules = ref(false)
const testResults = ref<ITestCampaignResponse | null>(null)
const showTestResultsModal = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const campaignMeta = ref<IPaginationMeta>({
  currentPage: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  limit: 10,
  totalPages: 0,
  totalRecords: 0,
})

const fetchCampaigns = async (
  { pageSize = 1, limitSize = campaignMeta.value.limit || 10 } = {
    pageSize: 1,
    limitSize: 10,
  }
) => {
  // Si hay un rango de fechas parcial o inválido, no hacer la petición
  const validDates = dateRange.value?.filter(date => date !== null && date instanceof Date) || []
  if (dateRange.value && dateRange.value.length > 0 && validDates.length < 2) {
    return
  }

  page.value = pageSize
  limit.value = limitSize
  loading.value = true

  try {
    const filters: Record<string, unknown> = {
      page: page.value,
      limit: limit.value,
    }

    // Solo agregar filtros que no estén vacíos
    if (search.value?.trim()) {
      filters.search = search.value.trim()
    }
    if (name.value?.trim()) {
      filters.name = name.value.trim()
    }
    if (status.value?.trim()) {
      filters.status = status.value
    }
    if (channelId.value?.trim()) {
      filters.channelId = Number(channelId.value)
    }
    if (dateRange.value && dateRange.value.length === 2) {
      filters.startDate = dateRange.value[0].toISOString()
      filters.endDate = dateRange.value[1].toISOString()
    }

    const response = await getCampaigns(filters)
    if (response && response.data && response.meta) {
      campaigns.value = response.data
      campaignMeta.value = response.meta
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('campaign.errors.load_campaigns'),
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCampaigns({ pageSize: 1, limitSize: 10 })
})

watch([search, name, status, channelId], () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    fetchCampaigns({ pageSize: 1, limitSize: 10 })
  }, 300)
})

// Watch separado para dateRange sin deep watching
watch(dateRange, (newValue, oldValue) => {
  // Verificar que las fechas sean válidas (no null)
  const oldValidDates = oldValue?.filter(date => date !== null && date instanceof Date)?.length || 0
  const newValidDates = newValue?.filter(date => date !== null && date instanceof Date)?.length || 0

  // Solo ejecutar watch si:
  // 1. Se completó el rango (llegó a 2 fechas VÁLIDAS)
  // 2. Se limpió el rango (de 2 válidas a 0)
  if ((newValidDates === 2) || (oldValidDates === 2 && newValidDates === 0)) {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      fetchCampaigns({ pageSize: 1, limitSize: 10 })
    }, 300)
  }
})

const handleSelectionChange = (selectedRow: ICampaign) => {
  selected.value = selectedRow
  // Limpiar resultados de test cuando cambia la selección
  testResults.value = null
  showTestResultsModal.value = false
}

const handleDelete = async () => {
  if (!selected.value) return

  try {
    await deleteCampaign(selected.value.id)
    selected.value = null
    toast.add({
      severity: 'success',
      summary: t('general.success'),
      detail: t('campaign.success.removed'),
      life: 3000,
    })
    await fetchCampaigns({ pageSize: page.value, limitSize: limit.value })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('campaign.errors.removed'),
      life: 3000,
    })
  }
}

// Helper para convertir días de campaña a formato API
const convertDaysToApiFormat = (days: string[]): string[] => {
  const dayMapping: Record<string, string> = {
    '0': 'SU', // Sunday
    '1': 'MO', // Monday
    '2': 'TU', // Tuesday
    '3': 'WE', // Wednesday
    '4': 'TH', // Thursday
    '5': 'FR', // Friday
    '6': 'SA', // Saturday
  }

  return days.map(day => dayMapping[day] || day)
}

const handleTestRules = async () => {
  if (!selected.value?.campaignRules?.length) {
    toast.add({
      severity: 'warn',
      summary: t('general.warning'),
      detail: t('campaign.no_rules_warning'),
      life: 3000,
    })
    return
  }

  testingRules.value = true
  testResults.value = null
  showTestResultsModal.value = false

  try {
    const testRequest: ITestCampaignRequest = {
      rules: selected.value.campaignRules.map(rule => ({
        conditionType: rule.conditionType,
        value: rule.value,
        customFieldId: rule.customFieldId
      })),
      executions: {
        startDate: selected.value.startDate,
        endDate: selected.value.endDate,
        time: selected.value.time,
        days: convertDaysToApiFormat(selected.value.days || []),
        frequency: selected.value.frequency,
        maxExecutions: 10 // Limitar a 10 próximas ejecuciones para el preview
      }
    }

    const response = await testCampaign(testRequest)
    testResults.value = response
    showTestResultsModal.value = true

        toast.add({
      severity: 'success',
      summary: t('general.success'),
      detail: response.rules ? t('campaign.test_completed', {
        selected: response.rules.selected.toLocaleString(),
        total: response.rules.total.toLocaleString(),
        percent: response.rules.percent.toFixed(2)
      }) : t('campaign.test_completed_executions'),
      life: 5000,
    })
  } catch (error) {
    console.error('Error testing campaign rules:', error)
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('campaign.test_error'),
      life: 3000,
    })
  } finally {
    testingRules.value = false
  }
}

const headerActions = computed(() => [
  {
    label: t('actions.create'),
    onClick: () => push('/campaigns/create'),
    type: ActionTypes.CREATE,
  },
  ...(selected.value
    ? [
        {
          label: testingRules.value ? t('campaign.testing_rules') : t('campaign.test_rules'),
          onClick: handleTestRules,
          type: ActionTypes.VIEW,
          disabled: testingRules.value || !selected.value?.campaignRules?.length,
        },
        { label: t('actions.delete'), onClick: handleDelete, type: ActionTypes.DELETE },
        {
          label: t('actions.edit'),
          onClick: () => {
            if (selected.value?.id) {
              push(`/campaigns/edit/${selected.value?.id}`)
            }
          },
          type: ActionTypes.EDIT,
        },
      ]
    : []),
])


</script>
<template>
  <AppHeader :icon="IconTypes.CAMPAIGNS" :actions="headerActions" />
  <CardFilterCampaigns
    v-model:search="search"
    v-model:name="name"
    v-model:status="status"
    v-model:channelId="channelId"
    v-model:dateRange="dateRange"
  />

  <!-- Modal de Resultados del Test -->
  <TestResultsModal
    v-model:visible="showTestResultsModal"
    :campaign="selected"
    :test-results="testResults"
  />

  <AppTable
    class="w-full mt-4"
    :data="campaigns"
    :headers="[
      { field: 'name', header: $t('campaign.name') },
      { field: 'frequency', header: $t('campaign.frequency') },
      { field: 'channelName', header: $t('campaign.channel') },
      { field: 'startDate', header: $t('campaign.start_date') },
      { field: 'endDate', header: $t('campaign.end_date') },
      { field: 'status', header: $t('campaign.status') },
    ]"
    :pageSize="campaignMeta.limit"
    :pageCurrent="campaignMeta.currentPage"
    :totalItems="campaignMeta.totalRecords"
    :multipleSelection="false"
    :loading="loading"
    textTotalItems="campaign.campaigns"
    :autoDetectDateFields="true"
    @selection-change="handleSelectionChange"
    @page-change="({ pageSize }) => fetchCampaigns({ pageSize, limitSize: campaignMeta.limit })"
  >
    <template #header-name>
      <div class="flex items-center">
        <CredentialIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.name') }}</span>
      </div>
    </template>
    <template #header-frequency>
      <div class="flex items-center">
        <ModuleIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.frequency') }}</span>
      </div>
    </template>
    <template #header-channelName>
      <div class="flex items-center">
        <ChannelIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.channel') }}</span>
      </div>
    </template>
    <template #header-startDate>
      <div class="flex items-center">
        <DateStartIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.start_date') }}</span>
      </div>
    </template>
    <template #header-endDate>
      <div class="flex items-center">
        <DateEndIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.end_date') }}</span>
      </div>
    </template>
    <template #header-status>
      <div class="flex items-center">
        <StatusIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.status') }}</span>
      </div>
    </template>
    <template #custom-channelName="{ data }">
      <div>{{ data.channel?.name || '-' }}</div>
    </template>
    <template #custom-frequency="{ data }">
      <div>
        <template v-if="data.days && data.days.length">
          {{ data.days.map((day: string) => $t(`campaign.days_abbr.${day}`)).join(', ') }} {{ data.time }}
        </template>
        <template v-else-if="data.frequency">
          {{ $t(`campaign.frequency_types.${data.frequency}`) }}
        </template>
        <template v-else>-</template>
      </div>
    </template>
    <template #custom-status="{ data }">
      <div class="flex justify-center">
        <AppTag :label="data.status === 'active' ? $t('general.active') : $t('general.inactive')" />
      </div>
    </template>
  </AppTable>
</template>
<style lang="scss"></style>
