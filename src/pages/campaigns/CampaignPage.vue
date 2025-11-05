<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import Dialog from 'primevue/dialog'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import ChannelIcon from '@/assets/svg/channel.svg?component'
import CredentialIcon from '@/assets/svg/credential.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import DateEndIcon from '@/assets/svg/date_end.svg?component'
import DateStartIcon from '@/assets/svg/date_start.svg?component'
import TagIcon from '@/assets/svg/lucide/tag.svg?component'
import ModuleIcon from '@/assets/svg/module.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppDateRangePicker from '@/components/atoms/datepickers/AppDateRangePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppStatusSelect from '@/components/atoms/selects/AppStatusSelect.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import AppFilterPanel from '@/components/molecules/filter-panel/AppFilterPanel.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import TagManager from '@/components/molecules/TagManager.vue'
import { useActiveFiltersCount } from '@/composables/useActiveFiltersCount'
import { useDateFormat } from '@/composables/useDateFormat'
import { useStatusColors } from '@/composables/useStatusColors'
import { useTableTypes } from '@/composables/useTableTypes'
import type { ICampaign } from '@/services/campaign/interfaces/campaign.interface'
import type { IDuplicateCampaign } from '@/services/campaign/interfaces/duplicate-campaign.interface'
import type { ITestCampaignRequest, ITestCampaignResponse } from '@/services/campaign/interfaces/test-rules.interface'
import { useCampaignService } from '@/services/campaign/useCampaignService'
import type { IChannel } from '@/services/channel/interfaces/channel.interface'
import { useChannelService } from '@/services/channel/useChannelService'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'

import CampaignDuplicateModal from './components/CampaignDuplicateModal.vue'
import CampaignTestModal from './components/CampaignTestModal.vue'
import { useCampaignFilter } from './composables/useCampaignFilter'

const { t } = useI18n()
const { push } = useRouter()
const { listCampaigns, deleteCampaign, testCampaign, duplicateCampaign } = useCampaignService()
const { search, name, status, channelId, dateRange, tagIds } = useCampaignFilter()
const { getTableValueWithDefault, getNestedTableValue, hasTableValue } = useTableTypes()
const { getStatusSeverity } = useStatusColors()
const { formatDate } = useDateFormat()
const { activeFiltersCount } = useActiveFiltersCount({ search, name, status, channelId, dateRange, tagIds })
const { listChannels } = useChannelService()

const showMobileModal = ref(false)
const showTagsModal = ref(false)
const selectedCampaignTags = ref<Array<{id: string, name: string, color?: string}>>([])

const channels = ref<IChannel[]>([])

const handleShowAllTags = (tags: Array<{id: string, name: string, color?: string}>) => {
  selectedCampaignTags.value = tags
  showTagsModal.value = true
}

const handleRowDoubleClick = (campaign: Record<string, unknown>) => {
  const campaignId = campaign.id as string
  if (campaignId) {
    push(`/campaigns/edit/${campaignId}`)
  }
}

const ensureColorWithHash = (color?: string): string => {
  const sanitized = (color ?? '').trim().replace(/^#+/, '')
  if (!sanitized) {
    return '#6B7280' // Fallback color
  }
  return `#${sanitized}`
}
const loadingChannels = ref(false)
const toast = useToast()
const confirm = useConfirm()

const page = ref(1)
const limit = ref(10)
const campaigns = ref<ICampaign[]>([])
const selected = ref<ICampaign[]>([])
const loading = ref(false)
const testingRules = ref(false)
const testResults = ref<ITestCampaignResponse | null>(null)
const showTestResultsModal = ref(false)
const showDuplicateModal = ref(false)
const duplicateModalRef = ref<InstanceType<typeof CampaignDuplicateModal> | null>(null)
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
    if (tagIds.value && tagIds.value.length > 0) {
      filters.tagIds = tagIds.value
    }
    if (dateRange.value && dateRange.value.length === 2) {
      filters.startDate = dateRange.value[0].toISOString()
      filters.endDate = dateRange.value[1].toISOString()
    }

    const response = await listCampaigns(filters)
    if (response && response.data && response.meta) {
      campaigns.value = response.data
      campaignMeta.value = response.meta
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('campaign.common.error'),
      detail: t('campaign.errors.load_campaigns'),
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCampaigns({ pageSize: 1, limitSize: 10 })
  fetchChannels()
})

const fetchChannels = async () => {
  loadingChannels.value = true
  try {
    const response = await listChannels()
    if (response) {
      channels.value = response
    }
  } catch (error) {
    console.error('Error loading channels:', error)
  } finally {
    loadingChannels.value = false
  }
}

watch([search, name, status, channelId, tagIds], () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    fetchCampaigns({ pageSize: 1, limitSize: 10 })
  }, 300)
}, { deep: true })

watch(dateRange, (newValue, oldValue) => {
  const oldValidDates = oldValue?.filter(date => date !== null && date instanceof Date)?.length || 0
  const newValidDates = newValue?.filter(date => date !== null && date instanceof Date)?.length || 0

  if ((newValidDates === 2) || (oldValidDates === 2 && newValidDates === 0)) {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      fetchCampaigns({ pageSize: 1, limitSize: 10 })
    }, 300)
  }
})

const handleSelectionChange = (selection: Record<string, unknown> | Record<string, unknown>[] | null) => {
  const previousSelection = [...selected.value]

  if (selection === null || selection === undefined) {
    selected.value = []
  } else if (Array.isArray(selection)) {
    selected.value = selection as unknown as ICampaign[]
  } else {
    selected.value = [selection as unknown as ICampaign]
  }

  // Solo limpiar resultados de test si realmente cambió la selección
  const selectionChanged = previousSelection.length !== selected.value.length ||
    !previousSelection.every((prev, index) => prev.id === selected.value[index]?.id)

  if (selectionChanged) {
    testResults.value = null
    showTestResultsModal.value = false
  }
}

const handleDelete = async () => {
  if (!selected.value.length) return

  const isMultiple = selected.value.length > 1
  const campaignName = isMultiple ? '' : (selected.value[0].name || '')

  confirm.require({
    message: isMultiple
      ? t('campaign.delete_confirmation.message_multiple', { count: selected.value.length })
      : t('campaign.delete_confirmation.message_single', { name: campaignName }),
    header: t('campaign.delete_confirmation.title'),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.general.cancel'),
    acceptLabel: t('common.actions.delete'),
    accept: async () => {
      const campaignsToDelete = [...selected.value]
      try {
        if (campaignsToDelete.length === 1) {
          await deleteCampaign(campaignsToDelete[0].id)
        } else {
          await Promise.all(campaignsToDelete.map(campaign => deleteCampaign(campaign.id)))
        }

        selected.value = []
        toast.add({
          severity: 'success',
          summary: t('campaign.common.success'),
          detail: campaignsToDelete.length === 1
            ? t('campaign.actions.success_removed')
            : t('campaign.actions.success_removed_multiple', { count: campaignsToDelete.length }),
          life: 3000,
        })
        await fetchCampaigns({ pageSize: page.value, limitSize: limit.value })
      } catch {
        toast.add({
          severity: 'error',
          summary: t('campaign.common.error'),
          detail: t('campaign.errors.removed'),
          life: 3000,
        })
      }
    }
  })
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
  if (!selected.value.length) {
    toast.add({
      severity: 'warn',
      summary: t('campaign.common.warning'),
      detail: t('campaign.test_rules.no_selection_warning'),
      life: 3000,
    })
    return
  }

  // Solo permitir test de una campaña a la vez
  if (selected.value.length > 1) {
    toast.add({
      severity: 'warn',
      summary: t('campaign.common.warning'),
      detail: t('campaign.test_rules.single_test_warning'),
      life: 3000,
    })
    return
  }

  const campaign = selected.value[0]
  if (!campaign?.campaignRules?.length && !campaign?.tags?.length) {
    toast.add({
      severity: 'warn',
      summary: t('campaign.common.warning'),
      detail: t('campaign.test_rules.no_rules_or_tags_warning'),
      life: 3000,
    })
    return
  }

  testingRules.value = true
  testResults.value = null
  showTestResultsModal.value = false

  try {
    const testRequest: ITestCampaignRequest = {
      executions: {
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        time: campaign.time,
        days: convertDaysToApiFormat(campaign.days || []),
        frequency: campaign.frequency,
        maxExecutions: 10
      }
    }

    // Incluir reglas si existen
    if (campaign.campaignRules?.length) {
      testRequest.rules = campaign.campaignRules.map(rule => ({
        conditionType: rule.conditionType,
        value: rule.value,
        customFieldId: rule.customFieldId
      }))
    }

    // Incluir tags si existen
    if (campaign.tags?.length) {
      testRequest.tagIds = campaign.tags.map((tag: { id: string }) => tag.id)
    }

    const response = await testCampaign(testRequest)
    testResults.value = response
    showTestResultsModal.value = true

    toast.add({
      severity: 'success',
      summary: t('campaign.common.success'),
            detail: response.rules ? t('campaign.test_rules.test_completed', {
        selected: response.rules.selected,
        total: response.rules.total,
        percent: response.rules.percent.toFixed(1)
      }) : t('campaign.test_rules.test_completed_executions'),
      life: 5000,
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('campaign.common.error'),
      detail: t('campaign.test_rules.test_error'),
      life: 3000,
    })
  } finally {
    testingRules.value = false
  }
}

const handleDuplicate = async () => {
  if (!selected.value.length || selected.value.length > 1) {
    toast.add({
      severity: 'warn',
      summary: t('campaign.common.warning'),
      detail: t('campaign.duplicate.single_selection_warning'),
      life: 3000,
    })
    return
  }

  showDuplicateModal.value = true
}

const handleDuplicateSubmit = async (duplicateData: IDuplicateCampaign) => {
  if (!selected.value.length || !duplicateModalRef.value) return

  const campaign = selected.value[0]

  try {
    duplicateModalRef.value.setLoading(true)

    await duplicateCampaign(campaign.id, duplicateData)

    showDuplicateModal.value = false
    selected.value = []

    toast.add({
      severity: 'success',
      summary: t('campaign.common.success'),
      detail: t('campaign.duplicate.success'),
      life: 3000,
    })

    await fetchCampaigns({ pageSize: page.value, limitSize: limit.value })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('campaign.common.error'),
      detail: t('campaign.duplicate.error'),
      life: 3000,
    })
  } finally {
    if (duplicateModalRef.value) {
      duplicateModalRef.value.setLoading(false)
    }
  }
}

const headerActions = computed(() => {
  const baseActions = [
    {
      label: t('campaign.common.filters'),
      onClick: () => { showMobileModal.value = !showMobileModal.value },
      type: ActionTypes.FILTER,
      badge: activeFiltersCount.value,
    },
    {
      label: t('common.actions.create'),
      onClick: () => push('/campaigns/create'),
      type: ActionTypes.CREATE,
    },
  ]

  if (selected.value.length > 0) {
    baseActions.push({
      label: t('common.actions.test_rules'),
      onClick: handleTestRules,
      type: ActionTypes.VIEW,
    })

    baseActions.push({
      label: t('common.actions.delete'),
      onClick: handleDelete,
      type: ActionTypes.DELETE,
    })
  }

  if (selected.value.length === 1) {
    baseActions.push({
      label: t('common.actions.duplicate'),
      onClick: handleDuplicate,
      type: ActionTypes.DUPLICATE,
    })

    baseActions.push({
      label: t('common.actions.edit'),
      onClick: () => selected.value[0] && push(`/campaigns/edit/${selected.value[0].id}`),
      type: ActionTypes.EDIT,
    })
  }

  return baseActions
})

const getFormattedFrequency = (campaign: Record<string, unknown>): string => {
  if (hasTableValue(campaign, 'days') && getTableValueWithDefault<string[]>(campaign, 'days', []).length) {
    const days = getTableValueWithDefault<string[]>(campaign, 'days', [])
      .map((day: string) => t(`campaign.days_abbr.${day}`))
      .join(', ')
    const time = getTableValueWithDefault<string>(campaign, 'time', '')
    return `${days} ${time}`.trim()
  } else if (hasTableValue(campaign, 'frequency')) {
    return t(`campaign.frequency_types.${getTableValueWithDefault<string>(campaign, 'frequency', '')}`)
  }
  return '-'
}

// Agregar el campo calculado a los datos de campaigns
const campaignsWithFormattedFrequency = computed(() => {
  return campaigns.value.map(campaign => ({
    ...campaign,
    formattedFrequency: getFormattedFrequency(campaign)
  }))
})


</script>
<template>
  <AppHeader
    :icon="IconTypes.CAMPAIGNS"
    :actions="headerActions"
    :title="$t('campaign.general.campaigns')"
    :selectedItems="selected.length"
  />

  <AppFilterPanel
    v-model:showMobileModal="showMobileModal"
  >
    <AppInput
      v-model="search"
      type="text"
      class="w-full"
      :label="$t('campaign.common.search')"
    >
      <template #icon>
        <SearchIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>

    <AppInput
      v-model="name"
      type="text"
      class="w-full"
      :label="$t('campaign.common.name')"
    >
      <template #icon>
        <CredentialIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>

    <AppStatusSelect
      class="w-full"
      v-model="status"
      status-type="campaign"
      :label="$t('campaign.common.status')"
      :show-colors="true"
    >
      <template #icon>
        <StatusIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppStatusSelect>

    <AppSelect
      class="w-full"
      v-model="channelId"
      :options="channels.map(channel => ({ value: channel.id, name: channel.name }))"
      :label="$t('campaign.common.channel')"
      :loading="loadingChannels"
    >
      <template #icon>
        <ChannelIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppSelect>

    <AppDateRangePicker
      v-model="dateRange"
      class="w-full"
      :label="$t('campaign.common.date_range')"
    >
      <template #icon>
        <DateIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppDateRangePicker>

    <TagManager
      v-model="tagIds"
      :label="$t('campaign.common.tags')"
      :placeholder="$t('campaign.common.select_tags')"
      :allow-create="false"
      :allow-manage="false"
      class="w-full"
    />
  </AppFilterPanel>

  <!-- Modal de Resultados del Test -->
  <CampaignTestModal
    v-model:visible="showTestResultsModal"
    :campaign="selected"
    :test-results="testResults"
  />

  <!-- Modal de Duplicación -->
  <CampaignDuplicateModal
    ref="duplicateModalRef"
    v-model:visible="showDuplicateModal"
    :campaign="selected.length === 1 ? selected[0] : null"
    @duplicate="handleDuplicateSubmit"
  />

  <!-- Tags Modal -->
  <Dialog
    v-model:visible="showTagsModal"
    :header="$t('campaign.common.tags')"
    modal
    :style="{ width: '400px' }"
    :draggable="false"
  >
    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <AppTag
          v-for="tag in selectedCampaignTags"
          :key="tag.id"
          :label="tag.name"
          :style="{ backgroundColor: ensureColorWithHash(tag.color), color: 'white' }"
          size="small"
        />
      </div>
    </div>
  </Dialog>

  <AppTable
    class="w-full mt-4"
    :data="campaignsWithFormattedFrequency"
    :headers="[
      { field: 'name', header: $t('campaign.form.name') },
      { field: 'frequency', header: $t('campaign.form.frequency') },
      { field: 'channelName', header: $t('campaign.form.channel') },
      { field: 'tags', header: $t('campaign.common.tags') },
      { field: 'startDate', header: $t('campaign.form.start_date') },
      { field: 'endDate', header: $t('campaign.form.end_date') },
      { field: 'status', header: $t('campaign.form.status') },
    ]"
    :pageSize="campaignMeta.limit"
    :pageCurrent="campaignMeta.currentPage"
    :totalItems="campaignMeta.totalRecords"
    :multipleSelection="true"
    :loading="loading"
    textTotalItems="campaign.general.campaigns"
    :mobile-config="{
      title: { field: 'name' },
      subtitle: { field: 'formattedFrequency' },
      metadata: [
        { field: 'channelName', position: 'left', label: 'Canal' },
        { field: 'startDate', position: 'right', label: 'Inicio' }
      ],
      status: { field: 'status' },
      showAvatar: false
    }"
    @selection-change="handleSelectionChange"
    @page-change="({ pageSize }) => fetchCampaigns({ pageSize, limitSize: campaignMeta.limit })"
    @row-double-click="handleRowDoubleClick"
  >
    <template #header-name>
      <div class="flex items-center">
        <CredentialIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.form.name') }}</span>
      </div>
    </template>
    <template #header-frequency>
      <div class="flex items-center">
        <ModuleIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.form.frequency') }}</span>
      </div>
    </template>
    <template #header-channelName>
      <div class="flex items-center">
        <ChannelIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.form.channel') }}</span>
      </div>
    </template>
    <template #header-tags>
      <div class="flex items-center">
        <TagIcon class="w-5 h-5 mr-2" />
        <span>{{ $t('campaign.common.tags') }}</span>
      </div>
    </template>
    <template #header-startDate>
      <div class="flex items-center">
        <DateStartIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.form.start_date') }}</span>
      </div>
    </template>
    <template #header-endDate>
      <div class="flex items-center">
        <DateEndIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.form.end_date') }}</span>
      </div>
    </template>
    <template #header-status>
      <div class="flex items-center">
        <StatusIcon class="w-5 h-5 mr-2 fill-current" />
        <span>{{ $t('campaign.form.status') }}</span>
      </div>
    </template>
    <template #custom-channelName="{ data }">
      <div>{{ getNestedTableValue<string>(data, 'channel.name') || '-' }}</div>
    </template>
    <template #custom-tags="{ data }">
      <div class="flex justify-center">
        <template v-if="data.tags && data.tags.length > 0">
          <!-- Si hay solo un tag, mostrarlo -->
          <AppTag
            v-if="data.tags.length === 1"
            :label="data.tags[0].name"
            :style="{ backgroundColor: ensureColorWithHash(data.tags[0].color), color: 'white' }"
            size="small"
            class="text-xs"
          />
          <!-- Si hay múltiples tags, mostrar contador clickeable -->
          <AppTag
            v-else
            :label="`${data.tags.length} tags`"
            severity="info"
            size="small"
            class="text-xs cursor-pointer hover:bg-blue-600"
            @click="handleShowAllTags(data.tags)"
          />
        </template>
        <span v-else class="text-sm text-gray-400">-</span>
      </div>
    </template>
    <template #custom-frequency="{ data }">
      <div>
        <template v-if="hasTableValue(data, 'days') && getTableValueWithDefault<string[]>(data, 'days', []).length">
          {{ getTableValueWithDefault<string[]>(data, 'days', []).map((day: string) => $t(`campaign.days_abbr.${day}`)).join(', ') }} {{ getTableValueWithDefault<string>(data, 'time', '') }}
        </template>
        <template v-else-if="hasTableValue(data, 'frequency')">
          {{ $t(`campaign.frequency_types.${getTableValueWithDefault<string>(data, 'frequency', '')}`) }}
        </template>
        <template v-else>-</template>
      </div>
    </template>
    <template #custom-startDate="{ data }">
      <div>
        {{ getTableValueWithDefault<string>(data, 'startDate', '') ?
           formatDate(getTableValueWithDefault<string>(data, 'startDate', '')) : '-' }}
      </div>
    </template>
    <template #custom-endDate="{ data }">
      <div>
        {{ getTableValueWithDefault<string>(data, 'endDate', '') ?
           formatDate(getTableValueWithDefault<string>(data, 'endDate', '')) : '-' }}
      </div>
    </template>
    <template #custom-status="{ data }">
      <div class="flex justify-center">
        <AppTag
          :label="$t(`campaign.status.${getTableValueWithDefault<string>(data, 'status', 'inactive')}`)"
          :severity="getStatusSeverity(getTableValueWithDefault<string>(data, 'status', 'inactive'), 'campaign')"
        />
      </div>
    </template>
  </AppTable>
</template>
<style lang="scss"></style>
