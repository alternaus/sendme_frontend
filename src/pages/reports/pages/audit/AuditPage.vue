<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import ActionIcon from '@/assets/svg/action.svg?component'
import ChangeIcon from '@/assets/svg/change.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import ModuleIcon from '@/assets/svg/module.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import UserIcon from '@/assets/svg/user.svg?component'
import AppDateRangePicker from '@/components/atoms/datepickers/AppDateRangePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppFilterPanel from '@/components/molecules/filter-panel/AppFilterPanel.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useActiveFiltersCount } from '@/composables/useActiveFiltersCount'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'
import type { IAudit } from '@/services/report/interfaces/audit.interface'
import { useReportService } from '@/services/report/useReportServices'
import { formatTableValue } from '@/utils/table-type-utils'

import DialogChangesAudit from './components/DialogChangesAudit.vue'
import { useAuditFilter } from './composables/useAuditFilter'
import { ActionAuditTypes } from './enums/action-types.enum.ts'
import { ModuleTypes } from './enums/module-types.enum'
export default defineComponent({
  components: {
    AppHeader,
    AppTable,
    AppFilterPanel,
    AppInput,
    AppSelect,
    AppDateRangePicker,
    DateIcon,
    UserIcon,
    ActionIcon,
    ModuleIcon,
    ChangeIcon,
    SearchIcon,
    DialogChangesAudit,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const { getAudits, exportAudits } = useReportService()

    const { action, table, startDate, endDate, search } = useAuditFilter()
    const { activeFiltersCount } = useActiveFiltersCount({ action, table, startDate, endDate, search })

    const showMobileModal = ref(false)

    const dataChanges = ref<Record<string, unknown>>({})
    const isDialogVisible = ref(false)
    const page = ref(1)
    const limit = ref(10)
    const audits = ref<IAudit[]>([])
    const loading = ref(false)
    const auditMeta = ref<IPaginationMeta>({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 10,
      totalPages: 0,
      totalRecords: 0,
    })

    watch([startDate, endDate, action, table], () => {
      fetchAudits()
    })

    const fetchAudits = async ({ pageSize = 1, limitSize = 10 } = {}) => {
      page.value = pageSize
      limit.value = limitSize
      loading.value = true
      try {
        const response = await getAudits({
          page: page.value,
          limit: limit.value,
          action: action.value,
          table: table.value,
          startDate: startDate.value?.toISOString(),
          endDate: endDate.value?.toISOString(),
          //search: search.value,
        })
        if (response?.data && response?.meta) {
          audits.value = response.data
          auditMeta.value = response.meta
        } else {
        }
      } catch {
      } finally {
        loading.value = false
      }
    }

    const handleViewChanges = (rowData: Record<string, unknown>) => {
      const audit = rowData as unknown as IAudit
      if (audit.changes) {
        dataChanges.value = audit.changes
        isDialogVisible.value = true
      }
    }

    const headerActions = computed(() => [
      {
        label: t('common.actions.filter'),
        type: ActionTypes.FILTER,
        badge: activeFiltersCount.value > 0 ? activeFiltersCount.value : undefined,
        onClick: () => { showMobileModal.value = !showMobileModal.value },
      },
      {
        label: t('common.actions.export'),
        type: ActionTypes.EXPORT,
        onClick: () => {
          exportAudits({
            action: action.value,
            table: table.value,
            startDate: startDate.value?.toISOString(),
            endDate: endDate.value?.toISOString(),
            page: page.value,
            limit: limit.value,
          })
        },
      },
    ])

    onMounted(() => fetchAudits())
    const formatDate = (isoString: string) => {
      const date = new Date(isoString)
      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date)
    }

    const getActionTranslation = (action: unknown) => {
      const actionString = typeof action === 'string' ? action : String(action)
      const translationKey = ActionAuditTypes[actionString as keyof typeof ActionAuditTypes]
      return translationKey ? t(translationKey) : actionString
    }
    const getModuleTranslation = (module: unknown) => {
      const moduleString = typeof module === 'string' ? module : String(module)
      const translationKey = ModuleTypes[moduleString as keyof typeof ModuleTypes]
      return translationKey ? t(translationKey) : moduleString
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
      IconTypes,
      search,
      auditMeta,
      audits,
      fetchAudits,
      getActionTranslation,
      getModuleTranslation,
      headerActions,
      action,
      table,
      formatDate,
      dataChanges,
      handleViewChanges,
      isDialogVisible,
      startDateString,
      endDateString,
      loading,
      formatTableValue,
      ActionAuditTypes,
      ModuleTypes,
      showMobileModal,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.AUDIT" :text="$t('reports.audit')" :actions="headerActions" />

  <AppFilterPanel
    :header-actions="headerActions"
    v-model:showMobileModal="showMobileModal"
  >
    <AppInput
      :modelValue="search"
      type="text"
      class="w-full"
      :label="$t('reports.common.search')"
      @input="search = $event.target.value"
    >
      <template #icon>
        <SearchIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>

    <AppSelect
      class="w-full"
      :modelValue="action"
      :options="
        Object.entries(ActionAuditTypes).map(([key, value]) => ({ value: key, name: $t(value) }))
      "
      :label="$t('reports.common.action')"
      @update:modelValue="action = $event as string"
    >
      <template #icon>
        <ActionIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppSelect>

    <AppSelect
      class="w-full"
      :modelValue="table"
      :options="
        Object.entries(ModuleTypes).map(([key, value]) => ({ value: key, name: $t(value) }))
      "
      :label="$t('reports.common.module')"
      @update:modelValue="table = $event as string"
    >
      <template #icon>
        <ModuleIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppSelect>

    <AppDateRangePicker
      class="w-full col-span-1 sm:col-span-2"
      :startDate="startDateString"
      :endDate="endDateString"
      :startLabel="$t('reports.common.start_date')"
      :endLabel="$t('reports.common.end_date')"
      @update:startDate="startDateString = $event"
      @update:endDate="endDateString = $event"
    >
      <template #icon>
        <DateIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppDateRangePicker>
  </AppFilterPanel>
  <DialogChangesAudit
    :changesData="dataChanges"
    :visible="isDialogVisible"
    @update:visible="isDialogVisible = $event"
  />
  <AppTable
    class="w-full mt-4"
    :data="audits"
    :headers="[
      { field: 'createdAt', header: 'Date' },
      { field: 'userId', header: 'User' },
      { field: 'table', header: 'Module' },
      { field: 'changes', header: 'Changes' },
      { field: 'action', header: 'Action' },
    ]"
    :pageSize="auditMeta.limit"
    :pageCurrent="auditMeta.currentPage"
    :totalItems="auditMeta.totalRecords"
    :multipleSelection="false"
    :loading="loading"
    :emptyMessage="'reports.error_getting_audit'"
    textTotalItems="reports.audits"
    @page-change="fetchAudits"
  >
    <template #header-createdAt>
      <div class="flex items-center">
        <DateIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('reports.common.date') }} </span>
      </div>
    </template>
    <template #header-userId>
      <div class="flex items-center">
        <UserIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('common.user.user') }} </span>
      </div>
    </template>
    <template #header-table>
      <div class="flex items-center">
        <ModuleIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('reports.common.module') }} </span>
      </div>
    </template>
    <template #header-changes>
      <div class="flex items-center">
        <ChangeIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('reports.common.changes') }} </span>
      </div>
    </template>
    <template #header-action>
      <div class="flex items-center">
        <ActionIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('reports.common.action') }} </span>
      </div>
    </template>
    <template #custom-table="{ data }">
      <div class="flex justify-center">
        {{ formatTableValue<string, string>(data, 'table', getModuleTranslation, '') }}
      </div>
    </template>
    <template #custom-changes="{ data }">
      <div class="flex justify-center">
        <div
          v-if="data.changes"
          class="flex items-center justify-center w-6 h-6 rounded-full border-gray-400 border"
          @click="handleViewChanges(data)"
        >
          <i class="pi pi-eye"></i>
        </div>
        <small v-else>--</small>
      </div>
    </template>
    <template #custom-action="{ data }">
      <div class="flex justify-center">
        {{ formatTableValue<string, string>(data, 'action', getActionTranslation, '') }}
      </div>
    </template>
  </AppTable>
</template>
