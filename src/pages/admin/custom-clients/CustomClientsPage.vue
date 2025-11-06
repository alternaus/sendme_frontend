<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import SearchIcon from '@/assets/svg/search.svg?component'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import AppFilterPanel from '@/components/molecules/filter-panel/AppFilterPanel.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useActiveFiltersCount } from '@/composables/useActiveFiltersCount'
import { useTableTypes } from '@/composables/useTableTypes'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'
import type { IOrganization } from '@/services/organization/interfaces/organization.interface'
import { useOrganizationService } from '@/services/organization/useOrganizationService'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const { listOrganizations } = useOrganizationService()
const { getNestedTableValue, getTableValueWithDefault } = useTableTypes()

const search = ref('')
const showMobileModal = ref(false)
const { activeFiltersCount } = useActiveFiltersCount({ search })

const page = ref(1)
const limit = ref(10)
const clients = ref<IOrganization[]>([])
const selected = ref<IOrganization[]>([])
const loading = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const clientMeta = ref<IPaginationMeta>({
  currentPage: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  limit: 10,
  totalPages: 0,
  totalRecords: 0,
})

const headerActions = computed(() => {
  const baseActions = [
    {
      label: t('custom_clients.common.filters'),
      onClick: () => {
        showMobileModal.value = !showMobileModal.value
      },
      type: ActionTypes.FILTER,
      badge: activeFiltersCount.value,
    },
    {
      label: t('common.actions.create'),
      onClick: () => router.push({ name: 'custom-clients.create' }),
      type: ActionTypes.CREATE,
    },
  ]

  if (selected.value.length > 0) {
    baseActions.push({
      label: t('common.actions.delete'),
      onClick: handleDelete,
      type: ActionTypes.DELETE,
    })
  }

  return baseActions
})

const fetchClients = async (
  { pageSize = 1, limitSize = clientMeta.value.limit || 10 } = {
    pageSize: 1,
    limitSize: 10,
  }
) => {
  page.value = pageSize
  limit.value = limitSize
  loading.value = true

  try {
    const response = await listOrganizations()
    clients.value = response
    clientMeta.value = {
      currentPage: pageSize,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: limitSize,
      totalPages: Math.ceil(response.length / limitSize),
      totalRecords: response.length,
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('common.general.error'),
      detail: t('custom_clients.messages.load_error'),
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchClients({ pageSize: 1, limitSize: 10 })
})

watch(search, () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    fetchClients({ pageSize: 1, limitSize: 10 })
  }, 300)
})

const handleSelectionChange = (
  selection: Record<string, unknown> | Record<string, unknown>[] | null
) => {
  if (selection === null || selection === undefined) {
    selected.value = []
  } else if (Array.isArray(selection)) {
    selected.value = selection as unknown as IOrganization[]
  } else {
    selected.value = [selection as unknown as IOrganization]
  }
}

async function handleDelete() {
  if (!selected.value.length) return

  const isMultiple = selected.value.length > 1
  const clientName = isMultiple ? '' : selected.value[0].name || ''

  confirm.require({
    message: isMultiple
      ? t('custom_clients.delete_confirmation.message_multiple', { count: selected.value.length })
      : t('custom_clients.delete_confirmation.message_single', { name: clientName }),
    header: t('custom_clients.delete_confirmation.title'),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    rejectLabel: t('common.general.cancel'),
    acceptLabel: t('common.actions.delete'),
    accept: async () => {
      selected.value = []
      toast.add({
        severity: 'success',
        summary: t('common.general.success'),
        detail: t('custom_clients.messages.delete_success'),
        life: 3000,
      })
      await fetchClients({ pageSize: page.value, limitSize: limit.value })
    },
  })
}

const handleRowDoubleClick = (client: Record<string, unknown>) => {
  const clientId = client.id as string
  if (clientId) {
    router.push({ name: 'custom-clients.view', params: { id: clientId } })
  }
}
</script>

<template>
  <AppHeader
    :icon="IconTypes.SETTINGS"
    :actions="headerActions"
    :title="$t('custom_clients.list.title')"
    :selectedItems="selected.length"
  />

  <AppFilterPanel v-model:showMobileModal="showMobileModal">
    <AppInput v-model="search" type="text" class="w-full" :label="$t('custom_clients.list.search_placeholder')">
      <template #icon>
        <SearchIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>
  </AppFilterPanel>

  <AppTable
    class="w-full mt-4"
    :data="clients"
    :headers="[
      { field: 'name', header: $t('custom_clients.list.columns.organization') },
      { field: 'planName', header: $t('custom_clients.list.columns.plan') },
      { field: 'messages', header: $t('custom_clients.list.columns.messages') },
      { field: 'status', header: $t('custom_clients.list.columns.status') },
    ]"
    :pageSize="clientMeta.limit"
    :pageCurrent="clientMeta.currentPage"
    :totalItems="clientMeta.totalRecords"
    :multipleSelection="true"
    :loading="loading"
    textTotalItems="custom_clients.clients"
    :mobile-config="{
      title: { field: 'name' },
      subtitle: { field: 'document' },
      metadata: [
        { field: 'planName', position: 'left', label: 'Plan' },
        { field: 'status', position: 'right', label: 'Estado' }
      ],
      status: { field: 'status' },
      showAvatar: false
    }"
    @selection-change="handleSelectionChange"
    @page-change="({ pageSize }) => fetchClients({ pageSize, limitSize: clientMeta.limit })"
    @row-double-click="handleRowDoubleClick"
  >
    <template #custom-name="{ data }">
      <span class="font-medium">{{ getTableValueWithDefault(data, 'name', '') }}</span>
    </template>

    <template #custom-planName="{ data }">
      <span>{{ getNestedTableValue<string>(data, 'plan.name') || '-' }} - ${{ getNestedTableValue<number>(data, 'plan.cost') || 0 }}/mes</span>
    </template>

    <template #custom-messages="{ data }">
      <span>${{ getNestedTableValue<number>(data, 'plan.pricePerMessage') || 0 }}/msg</span>
    </template>

    <template #custom-status>
      <div class="flex justify-center">
        <AppTag
          :label="$t('custom_clients.list.status.active')"
          severity="success"
          size="small"
        />
      </div>
    </template>
  </AppTable>
</template>
